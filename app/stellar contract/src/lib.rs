// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Stellar Soroban Contracts ^0.1.0
#![no_std]

use openzeppelin_fungible_token::{
    self as fungible, FungibleToken, mintable::FungibleMintable
};
use soroban_sdk::{Address, contract, contractimpl, Env, String, Symbol, symbol_short};

const OWNER: Symbol = symbol_short!("OWNER");

#[contract]
pub struct MyToken;

#[contractimpl]
impl MyToken {
    pub fn __constructor(e: &Env) {
        fungible::metadata::set_metadata(e, 18, String::from_str(e, "codexcoin"), String::from_str(e, "CDX"));
       // e.storage().instance().set(&OWNER, &owner);
    }
}

#[contractimpl]
impl FungibleToken for MyToken {
    fn total_supply(e: &Env) -> i128 {
        fungible::total_supply(e)
    }

    fn balance(e: &Env, account: Address) -> i128 {
        fungible::balance(e, &account)
    }

    fn allowance(e: &Env, owner: Address, spender: Address) -> i128 {
        fungible::allowance(e, &owner, &spender)
    }

    fn transfer(e: &Env, from: Address, to: Address, amount: i128) {
        fungible::transfer(e, &from, &to, amount);
    }

    fn transfer_from(e: &Env, spender: Address, from: Address, to: Address, amount: i128) {
        fungible::transfer_from(e, &spender, &from, &to, amount);
    }

    fn approve(e: &Env, owner: Address, spender: Address, amount: i128, live_until_ledger: u32) {
        fungible::approve(e, &owner, &spender, amount, live_until_ledger);
    }

    fn decimals(e: &Env) -> u32 {
        fungible::metadata::decimals(e)
    }

    fn name(e: &Env) -> String {
        fungible::metadata::name(e)
    }

    fn symbol(e: &Env) -> String {
        fungible::metadata::symbol(e)
    }
}

//
// Extensions
//

#[contractimpl]
impl FungibleMintable for MyToken {
    fn mint(e: &Env, account: Address, amount: i128) {
        //let owner: Address = e.storage().instance().get(&OWNER).expect("owner should be set");
        //owner.require_auth();
        fungible::mintable::mint(e, &account, amount);
    }
}