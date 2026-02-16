import { createNft, findMetadataPda, mplTokenMetadata, verifyCollectionV1 } from "@metaplex-foundation/mpl-token-metadata";
import { airdropIfRequired, getExplorerLink, getKeypairFromFile } from "@solana-developers/helpers";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { clusterApiUrl, Connection, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { generateSigner, keypairIdentity, percentAmount, publicKey } from "@metaplex-foundation/umi";

const connection = new Connection(clusterApiUrl("devnet"));
const user = await getKeypairFromFile();

await airdropIfRequired(connection, user.publicKey, 1 * LAMPORTS_PER_SOL, 0.5 * LAMPORTS_PER_SOL);
console.log("Loaded user", user.publicKey.toBase58());

const umi = createUmi(connection.rpcEndpoint);
umi.use(mplTokenMetadata());

const umiUser = umi.eddsa.createKeypairFromSecretKey(user.secretKey);
umi.use(keypairIdentity(umiUser));

console.log("set up Umi instance for user");

// Use Umi's publicKey function to convert string addresses
const collectionAddress = publicKey("Ursg8AWN7SxRKE5xQQWize17TtjptGPRxJKs82hqg2p");
const nftAddress = publicKey("Ursg8AWN7SxRKE5xQQWize17TtjptGPRxJKs82hqg2p");
// const nftAddress = publicKey("ACTUAL_NFT_MINT_ADDRESS_HERE");

const transaction = await verifyCollectionV1(umi, {
    metadata: findMetadataPda(umi, { mint: nftAddress }),
    collectionMint: collectionAddress,
    authority: umi.identity
});

await transaction.sendAndConfirm(umi);

console.log(`NFT ${nftAddress} is now verified as part of collection ${collectionAddress}!
See explorer at ${getExplorerLink("address", nftAddress.toString(), "devnet")}`);