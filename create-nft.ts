import { createNft, fetchDigitalAsset, mplTokenMetadata } from "@metaplex-foundation/mpl-token-metadata";
import { airdropIfRequired, getExplorerLink, getKeypairFromFile } from "@solana-developers/helpers";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { clusterApiUrl, Connection, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { generateSigner, keypairIdentity, percentAmount } from "@metaplex-foundation/umi";

const collectionAddress = new PublicKey("Ursg8AWN7SxRKE5xQQWize17TtjptGPRxJKs82hqg2p")

const mint = generateSigner(umi);

const transaction = await createNft(Umi, {
    mint, 
    name: "My NFT",
    symbol: "NFT",
    uri: "https://arweave.net/1234567890",
    sellerFeeBasisPoints: percentAmount(0), // 5% royalty
    collection: {
        key: collectionAddress,
        verified: false
    }
})

await transaction.sendAndConfirm(Umi, { commitment: "confirmed" });

const createdNft = await fetchDigitalAsset(Umi, mint.publicKey);

console.log("Created NFT", getExplorerLink(mint.publicKey));