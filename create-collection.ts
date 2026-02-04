// Import functions to create NFTs and fetch digital asset data from Metaplex
import { createNft, fetchDigitalAsset, mplTokenMetadata } from "@metaplex-foundation/mpl-token-metadata";

// Import helper utilities for airdrops, explorer links, and loading keypairs from files
import { airdropIfRequired, getExplorerLink, getKeypairFromFile } from "@solana-developers/helpers";

// Import the Umi framework initialization function
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";

// Import Solana web3.js utilities for connecting to the network
import { clusterApiUrl, Connection, LAMPORTS_PER_SOL } from "@solana/web3.js";

// Import Umi utilities for generating signers, setting identity, and calculating percentages
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

// Generate a new random keypair that will serve as the mint address for the collection
const collectionMint = generateSigner(umi);

// Create a transaction to mint a new NFT configured as a collection
const transaction = await createNft(umi, {
    mint: collectionMint, // The mint account/address for this collection
    name: "GOODBADBOY", // The display name of the collection
    symbol: "ADEMOLA", // The ticker symbol for the collection
    uri: "https://raw.githubusercontent.com/GOODBADBOY10/new-token/main/metadata.json", // URL pointing to off-chain metadata (JSON)
    sellerFeeBasisPoints: percentAmount(0), // Royalty percentage (0% = no royalties)
    isCollection: true, // Flag indicating this NFT is a collection parent, not a regular NFT
})

// Send the transaction to the blockchain and wait for confirmation
await transaction.sendAndConfirm(umi);

// Fetch the on-chain data for the newly created collection NFT
const createCollectionNft = await fetchDigitalAsset(umi, collectionMint.publicKey);

// Log the Solana Explorer link for viewing the collection NFT on devnet
console.log(`Created collection NFT: Address is ${getExplorerLink
    ("address", // Type of link (address, transaction, or block)
        createCollectionNft.mint.publicKey, // The mint address of the collection
        "devnet" // The cluster/network to link to
    )}`);