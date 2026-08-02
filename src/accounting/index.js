#!/usr/bin/env node

const readline = require("node:readline/promises");
const { stdin: input, stdout: output } = require("node:process");

const DEFAULT_BALANCE = 1000.0;
let storageBalance = DEFAULT_BALANCE;

function displayMenu() {
  console.log("--------------------------------");
  console.log("Account Management System");
  console.log("1. View Balance");
  console.log("2. Credit Account");
  console.log("3. Debit Account");
  console.log("4. Exit");
  console.log("--------------------------------");
}

function resetAccountState() {
  storageBalance = DEFAULT_BALANCE;
}

function readBalance() {
  return storageBalance;
}

function writeBalance(balance) {
  storageBalance = balance;
  return storageBalance;
}

function parseAmount(amountInput) {
  const parsedAmount = Number.parseFloat(amountInput);

  if (Number.isFinite(parsedAmount) && parsedAmount >= 0) {
    return parsedAmount;
  }

  return null;
}

function viewBalance() {
  const balance = readBalance();
  const message = `Current balance: ${balance.toFixed(2)}`;
  console.log(message);
  return message;
}

function creditAccount(amount) {
  const balance = readBalance();
  const newBalance = balance + amount;
  writeBalance(newBalance);
  const message = `Amount credited. New balance: ${newBalance.toFixed(2)}`;
  console.log(message);
  return message;
}

function debitAccount(amount) {
  const balance = readBalance();

  if (balance >= amount) {
    const newBalance = balance - amount;
    writeBalance(newBalance);
    const message = `Amount debited. New balance: ${newBalance.toFixed(2)}`;
    console.log(message);
    return message;
  }

  const message = "Insufficient funds for this debit.";
  console.log(message);
  return message;
}

function handleMenuChoice(choice, amountInput = null) {
  if (choice === "1") {
    return viewBalance();
  }

  if (choice === "2") {
    const amount = parseAmount(amountInput);

    if (amount === null) {
      const message = "Invalid amount.";
      console.log(message);
      return message;
    }

    return creditAccount(amount);
  }

  if (choice === "3") {
    const amount = parseAmount(amountInput);

    if (amount === null) {
      const message = "Invalid amount.";
      console.log(message);
      return message;
    }

    return debitAccount(amount);
  }

  if (choice === "4") {
    const message = "Exiting the program. Goodbye!";
    console.log(message);
    return message;
  }

  const message = "Invalid choice, please select 1-4.";
  console.log(message);
  return message;
}

async function main() {
  const rl = readline.createInterface({ input, output });

  while (true) {
    displayMenu();
    const choice = await rl.question("Enter your choice (1-4): ");

    if (choice === "1") {
      handleMenuChoice(choice);
    } else if (choice === "2") {
      const amountInput = await rl.question("Enter credit amount: ");
      handleMenuChoice(choice, amountInput);
    } else if (choice === "3") {
      const amountInput = await rl.question("Enter debit amount: ");
      handleMenuChoice(choice, amountInput);
    } else if (choice === "4") {
      handleMenuChoice(choice);
      rl.close();
      return;
    } else {
      handleMenuChoice(choice);
    }
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

module.exports = {
  DEFAULT_BALANCE,
  displayMenu,
  resetAccountState,
  readBalance,
  writeBalance,
  parseAmount,
  viewBalance,
  creditAccount,
  debitAccount,
  handleMenuChoice,
};
