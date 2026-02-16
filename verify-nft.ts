import { createNft, findMetadataPda, mplTokenMetadata, verifyCollectionV1 } from "@metaplex-foundation/mpl-token-metadata";
import { airdropIfRequired, getExplorerLink, getKeypairFromFile } from "@solana-developers/helpers";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { clusterApiUrl, Connection, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { generateSigner, keypairIdentity, percentAmount } from "@metaplex-foundation/umi";

// Create a connection to Solana's devnet cluster
const connection = new Connection(clusterApiUrl("devnet"));

// Load the user's keypair from a local file (typically ~/.config/solana/id.json)
const user = await getKeypairFromFile();

// Request an airdrop if the user's balance is below 0.5 SOL, topping up to 1 SOL
await airdropIfRequired(connection, user.publicKey, 1 * LAMPORTS_PER_SOL, 0.5 * LAMPORTS_PER_SOL);

// Log the user's public key to the console in base58 format
console.log("Loaded user", user.publicKey.toBase58());

// Initialize the Umi framework instance using the connection's RPC endpoint
const umi = createUmi(connection.rpcEndpoint);

// Register the Metaplex Token Metadata plugin with Umi to enable NFT operations
umi.use(mplTokenMetadata());

// Convert the web3.js keypair to an Umi-compatible keypair using the secret key
const umiUser = umi.eddsa.createKeypairFromSecretKey(user.secretKey);

// Set the Umi instance to use this keypair as the transaction signer/payer
umi.use(keypairIdentity(umiUser));

// Log confirmation that Umi is configured for the user
console.log("set up Umi instance for user");

const collectionAddress = new PublicKey("Ursg8AWN7SxRKE5xQQWize17TtjptGPRxJKs82hqg2p");
const nftAddress = new PublicKey("Ursg8AWN7SxRKE5xQQWize17TtjptGPRxJKs82hqg2p");

const transaction = await verifyCollectionV1(umi, {
    metadata: findMetadataPda(umi, { mint: nftAddress }),
    collectionMint: collectionAddress,
    authority: umi.identity
});

transaction.sendAndConfirm(umi);

console.log(`NFT ${nftAddress} is now verified as part of collection ${collectionAddress}!, see explorer
    at ${getExplorerLink(
        "address", 
        nftAddress,
        "devnet"
    )}`
);