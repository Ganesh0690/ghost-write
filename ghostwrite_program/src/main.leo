program ghostwrite_v1.aleo {

    @noupgrade
    async constructor() {}

    record ContentRecord {
        owner: address,
        content_hash: field,
        title_hash: field,
        timestamp: u64,
        price_microcredits: u64,
    }

    record AccessToken {
        owner: address,
        content_hash: field,
        author: address,
        granted_at: u64,
    }

    record AuthorshipProof {
        owner: address,
        content_hash: field,
        title_hash: field,
        created_at: u64,
    }

    struct ContentMeta {
        content_hash: field,
        price_microcredits: u64,
        total_purchases: u64,
        is_active: bool,
    }

    mapping published_content: field => ContentMeta;

    mapping content_exists: field => bool;

    async transition publish_content(
        title_hash: field,
        content_hash: field,
        price_microcredits: u64,
        timestamp: u64,
    ) -> (ContentRecord, AuthorshipProof, Future) {
        assert(price_microcredits > 0u64);

        let content_rec: ContentRecord = ContentRecord {
            owner: self.caller,
            content_hash: content_hash,
            title_hash: title_hash,
            timestamp: timestamp,
            price_microcredits: price_microcredits,
        };

        let proof: AuthorshipProof = AuthorshipProof {
            owner: self.caller,
            content_hash: content_hash,
            title_hash: title_hash,
            created_at: timestamp,
        };

        let meta: ContentMeta = ContentMeta {
            content_hash: content_hash,
            price_microcredits: price_microcredits,
            total_purchases: 0u64,
            is_active: true,
        };

        return (content_rec, proof, finalize_publish(content_hash, meta));
    }

    async function finalize_publish(
        content_hash: field,
        meta: ContentMeta,
    ) {
        let exists: bool = content_exists.get_or_use(content_hash, false);
        assert(!exists);
        published_content.set(content_hash, meta);
        content_exists.set(content_hash, true);
    }

    async transition purchase_content(
        content_hash: field,
        author: address,
        price_microcredits: u64,
        timestamp: u64,
    ) -> (AccessToken, Future) {
        let access: AccessToken = AccessToken {
            owner: self.caller,
            content_hash: content_hash,
            author: author,
            granted_at: timestamp,
        };

        return (access, finalize_purchase(content_hash, price_microcredits));
    }

    async function finalize_purchase(
        content_hash: field,
        price_microcredits: u64,
    ) {
        let exists: bool = content_exists.get(content_hash);
        assert(exists);
        let meta: ContentMeta = published_content.get(content_hash);
        assert(meta.is_active);
        assert_eq(meta.price_microcredits, price_microcredits);
        let updated_meta: ContentMeta = ContentMeta {
            content_hash: meta.content_hash,
            price_microcredits: meta.price_microcredits,
            total_purchases: meta.total_purchases + 1u64,
            is_active: meta.is_active,
        };
        published_content.set(content_hash, updated_meta);
    }

    transition reveal_authorship(
        proof: AuthorshipProof,
        public reveal_to: address,
    ) -> AuthorshipProof {
        return AuthorshipProof {
            owner: proof.owner,
            content_hash: proof.content_hash,
            title_hash: proof.title_hash,
            created_at: proof.created_at,
        };
    }
}