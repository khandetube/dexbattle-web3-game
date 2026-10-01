# DexBattle Arena — Web3 Game Developer Portfolio

A self-initiated technical prototype created specifically around the DexBattle Game Developer brief on LaborX.

> This is a portfolio demonstration, not a claim of previous client work or production deployment.

## Demonstrated

- Web3 game UI and responsive DApp architecture
- Wallet connection and transaction-state UX
- Match / duel state modelling
- Entry-fee and reward-flow presentation
- Solidity escrow reference contract
- Secure withdrawal pattern with checks-effects-interactions
- Non-reentrant withdrawal guard
- Separation of client/game state from settlement logic
- Ethereum-oriented Web3 integration points
- Clear extension points for DEX, token and stablecoin mechanics

## Live demo

If GitHub Pages is enabled for this repository, open:
https://khandetube.github.io/dexbattle-web3-game/

## Engineering note

The frontend uses a deterministic simulation so the demo works without a wallet, RPC endpoint or funded testnet account. The Solidity contract is a reference implementation.

For production, settlement authority should be replaced with properly designed verifiable game-result logic or an oracle, and the contract should undergo independent security review.

## Project structure

- index.html — responsive DApp/game interface
- style.css — visual system and responsive layout
- app.js — wallet/transaction/match-state simulation
- contracts/DexBattleEscrow.sol — Solidity escrow reference

## Accuracy

No real wallet, token, DEX or mainnet transaction is claimed here. The demo is deliberately transparent about what is simulated.
