#![cfg(test)]

use super::*;
use soroban_sdk::{testutils::Address as _, Address, Env};

#[contract]
struct DummyEscrowContract;

#[contractimpl]
impl DummyEscrowContract {
  pub fn release_payment(_env: Env, _order_id: u64, _supplier: Address, _amount: i128) {}
  pub fn refund_payment(_env: Env, _order_id: u64, _buyer: Address) {}
}

fn setup_env() -> (Env, Address, Address) {
  let env = Env::default();
  env.mock_all_auths();

  let contract_id = env.register(OrderContract, ());
  let client = OrderContractClient::new(&env, &contract_id);

  let escrow_contract = env.register(DummyEscrowContract, ());
  client.initialize(&escrow_contract);

  (env, contract_id, escrow_contract)
}

#[test]
fn test_create_order() {
  let (env, contract_id, _) = setup_env();
  let client = OrderContractClient::new(&env, &contract_id);

  let buyer = Address::generate(&env);
  let supplier = Address::generate(&env);
  let shipper = Address::generate(&env);
  let inspector = Address::generate(&env);

  let order_id = client.create_order(&buyer, &supplier, &shipper, &inspector, &1000_0000000);
  assert_eq!(order_id, 1);
  assert_eq!(client.get_order_count(), 1);

  let order = client.get_order(&1);
  assert_eq!(order.amount, 1000_0000000);
  assert_eq!(order.status, OrderStatus::Created);
}

#[test]
#[should_panic(expected = "Order amount must be positive")]
fn test_create_order_zero_amount() {
  let (env, contract_id, _) = setup_env();
  let client = OrderContractClient::new(&env, &contract_id);

  let buyer = Address::generate(&env);
  let supplier = Address::generate(&env);
  let shipper = Address::generate(&env);
  let inspector = Address::generate(&env);

  client.create_order(&buyer, &supplier, &shipper, &inspector, &0);
}

#[test]
fn test_order_lifecycle() {
  let (env, contract_id, _escrow_contract) = setup_env();
  let client = OrderContractClient::new(&env, &contract_id);

  let buyer = Address::generate(&env);
  let supplier = Address::generate(&env);
  let shipper = Address::generate(&env);
  let inspector = Address::generate(&env);

  let order_id = client.create_order(&buyer, &supplier, &shipper, &inspector, &500_0000000);

  // Escrow contract marks order as funded
  client.mark_funded(&order_id);
  assert_eq!(client.get_order(&1).status, OrderStatus::Funded);

  // Ship order
  client.ship_order(&shipper, &order_id);
  assert_eq!(client.get_order(&1).status, OrderStatus::Shipped);

  // Deliver order
  client.deliver_order(&shipper, &order_id);
  assert_eq!(client.get_order(&1).status, OrderStatus::Delivered);

  // Inspect order - Passed
  client.inspect_order(&inspector, &order_id, &true);
  assert_eq!(client.get_order(&1).status, OrderStatus::InspectedPassed);
}

#[test]
fn test_order_dispute_and_refund() {
  let (env, contract_id, _escrow_contract) = setup_env();
  let client = OrderContractClient::new(&env, &contract_id);

  let buyer = Address::generate(&env);
  let supplier = Address::generate(&env);
  let shipper = Address::generate(&env);
  let inspector = Address::generate(&env);

  let order_id = client.create_order(&buyer, &supplier, &shipper, &inspector, &800_0000000);

  // Fund order
  client.mark_funded(&order_id);
  assert_eq!(client.get_order(&1).status, OrderStatus::Funded);

  // Buyer raises dispute
  client.dispute_order(&buyer, &order_id);
  assert_eq!(client.get_order(&1).status, OrderStatus::Disputed);

  // Buyer claims refund on disputed order
  client.refund_order(&buyer, &order_id);
  assert_eq!(client.get_order(&1).status, OrderStatus::Refunded);
}
