# DexBattle Arena — Technical Architecture

## Objective

Demonstrate the engineering architecture required for a Web3 competitive-game platform: wallet authentication, match lifecycle, escrowed entry fees, deterministic transaction UX, and a security-conscious settlement boundary.

## System flow

Player -> Wallet -> DApp UI -> Match API / game state -> Smart-contract settlement -> On-chain events -> UI state

The prototype intentionally keeps gameplay state off-chain and financial settlement on-chain. This separation reduces unnecessary on-chain computation while keeping value transfer auditable.

## Match lifecycle

1. Player connects a wallet.
2. DApp requests a match entry transaction.
3. Contract records the match and accepted players.
4. Game session runs through the application layer.
5. A trusted/verifiable settlement mechanism resolves the result.
6. Contract credits the winner.
7. Winner withdraws the credited balance.

## Security considerations

- Reentrancy protection on withdrawals.
- Checks-effects-interactions ordering.
- Explicit match state transitions.
- Exact entry-fee validation.
- No direct assumption that frontend state is trustworthy.
- Settlement authority must be replaced with a verifiable game-result mechanism before production.
- Contract should be independently audited before handling real funds.

## Web3 integration boundary

The UI is designed so a production adapter can replace the simulation with a real EVM provider. The adapter would handle:

- chain/network detection
- wallet connection and account changes
- contract reads/writes
- transaction lifecycle and confirmations
- event subscriptions
- rejected / reverted transactions
- RPC failures and retry-safe UX

## DeFi / token extension points

The current reference uses native ETH-style value transfer to keep the example compact. A production implementation can introduce ERC-20 entry assets such as stablecoins, with explicit allowance/transferFrom handling and token-decimal normalization. DEX functionality should be isolated behind a dedicated integration layer rather than mixed into match settlement.

## What is real vs simulated

Real code in this repository:
- responsive DApp interface
- match-state UX
- transaction-state UX
- Solidity escrow reference
- architecture documentation

Simulated:
- wallet connection
- RPC calls
- blockchain confirmations
- live matchmaking
- game-result verification

This distinction is intentional so the portfolio sample remains reproducible without requiring a funded wallet or external infrastructure.
