const test = require("node:test");
const assert = require("node:assert/strict");

const {
  DEFAULT_BALANCE,
  resetAccountState,
  readBalance,
  writeBalance,
  parseAmount,
  viewBalance,
  creditAccount,
  debitAccount,
  handleMenuChoice,
} = require("../index.js");

test("TC-001: main menu display matches original options", () => {
  const originalLog = console.log;
  const logs = [];
  console.log = (...args) => logs.push(args.join(" "));

  try {
    const menu = [
      "--------------------------------",
      "Account Management System",
      "1. View Balance",
      "2. Credit Account",
      "3. Debit Account",
      "4. Exit",
      "--------------------------------",
    ];

    const displayMenu = require("../index.js").displayMenu;
    displayMenu();

    assert.deepEqual(
      logs,
      menu.map((line) => line),
    );
  } finally {
    console.log = originalLog;
  }
});

test("TC-002: invalid menu choice is rejected", () => {
  const originalLog = console.log;
  const logs = [];
  console.log = (...args) => logs.push(args.join(" "));

  try {
    handleMenuChoice("9");
    assert.equal(logs[0], "Invalid choice, please select 1-4.");
  } finally {
    console.log = originalLog;
  }
});

test("TC-003: viewing balance returns the default starting balance", () => {
  resetAccountState();
  const originalLog = console.log;
  const logs = [];
  console.log = (...args) => logs.push(args.join(" "));

  try {
    const message = viewBalance();
    assert.equal(readBalance(), DEFAULT_BALANCE);
    assert.equal(message, `Current balance: ${DEFAULT_BALANCE.toFixed(2)}`);
    assert.equal(logs[0], `Current balance: ${DEFAULT_BALANCE.toFixed(2)}`);
  } finally {
    console.log = originalLog;
  }
});

test("TC-004: credit operation increases the balance and preserves the expected message", () => {
  resetAccountState();
  const originalLog = console.log;
  const logs = [];
  console.log = (...args) => logs.push(args.join(" "));

  try {
    const message = creditAccount(250.0);
    assert.equal(readBalance(), 1250.0);
    assert.equal(message, "Amount credited. New balance: 1250.00");
    assert.equal(logs[0], "Amount credited. New balance: 1250.00");
  } finally {
    console.log = originalLog;
  }
});

test("TC-005: debit operation decreases the balance when funds are available", () => {
  resetAccountState();
  const originalLog = console.log;
  const logs = [];
  console.log = (...args) => logs.push(args.join(" "));

  try {
    const message = debitAccount(200.0);
    assert.equal(readBalance(), 800.0);
    assert.equal(message, "Amount debited. New balance: 800.00");
    assert.equal(logs[0], "Amount debited. New balance: 800.00");
  } finally {
    console.log = originalLog;
  }
});

test("TC-006: debit operation rejects an overdrawn amount", () => {
  resetAccountState();
  const originalLog = console.log;
  const logs = [];
  console.log = (...args) => logs.push(args.join(" "));

  try {
    const message = debitAccount(1500.0);
    assert.equal(readBalance(), DEFAULT_BALANCE);
    assert.equal(message, "Insufficient funds for this debit.");
    assert.equal(logs[0], "Insufficient funds for this debit.");
  } finally {
    console.log = originalLog;
  }
});

test("TC-007: failed debit attempt does not modify the stored balance", () => {
  resetAccountState();
  const originalLog = console.log;
  const logs = [];
  console.log = (...args) => logs.push(args.join(" "));

  try {
    const failedMessage = debitAccount(1500.0);
    const currentBalanceMessage = viewBalance();

    assert.equal(failedMessage, "Insufficient funds for this debit.");
    assert.equal(readBalance(), DEFAULT_BALANCE);
    assert.equal(
      currentBalanceMessage,
      `Current balance: ${DEFAULT_BALANCE.toFixed(2)}`,
    );
    assert.equal(logs[0], "Insufficient funds for this debit.");
    assert.equal(logs[1], `Current balance: ${DEFAULT_BALANCE.toFixed(2)}`);
  } finally {
    console.log = originalLog;
  }
});

test("TC-008: exit option prints the expected goodbye message", () => {
  const originalLog = console.log;
  const logs = [];
  console.log = (...args) => logs.push(args.join(" "));

  try {
    const message = handleMenuChoice("4");
    assert.equal(message, "Exiting the program. Goodbye!");
    assert.equal(logs[0], "Exiting the program. Goodbye!");
  } finally {
    console.log = originalLog;
  }
});

test("TC-009: credit scenario persists the update through read/write semantics", () => {
  resetAccountState();
  const originalLog = console.log;
  const logs = [];
  console.log = (...args) => logs.push(args.join(" "));

  try {
    creditAccount(250.0);
    const balanceMessage = viewBalance();

    assert.equal(readBalance(), 1250.0);
    assert.equal(balanceMessage, "Current balance: 1250.00");
    assert.equal(logs[0], "Amount credited. New balance: 1250.00");
    assert.equal(logs[1], "Current balance: 1250.00");
  } finally {
    console.log = originalLog;
  }
});

test("TC-010: debit scenario persists the update through read/write semantics", () => {
  resetAccountState();
  const originalLog = console.log;
  const logs = [];
  console.log = (...args) => logs.push(args.join(" "));

  try {
    debitAccount(200.0);
    const balanceMessage = viewBalance();

    assert.equal(readBalance(), 800.0);
    assert.equal(balanceMessage, "Current balance: 800.00");
    assert.equal(logs[0], "Amount debited. New balance: 800.00");
    assert.equal(logs[1], "Current balance: 800.00");
  } finally {
    console.log = originalLog;
  }
});

test("TC-011: default balance rule is applied on first execution", () => {
  resetAccountState();
  assert.equal(readBalance(), DEFAULT_BALANCE);
});

test("TC-012: session balance does not persist across a new runtime instance", () => {
  resetAccountState();
  creditAccount(250.0);
  assert.equal(readBalance(), 1250.0);
  resetAccountState();
  assert.equal(readBalance(), DEFAULT_BALANCE);
});

test("parseAmount rejects invalid numeric input", () => {
  assert.equal(parseAmount("abc"), null);
  assert.equal(parseAmount("-5"), null);
  assert.equal(parseAmount("0"), 0);
  assert.equal(parseAmount("75.5"), 75.5);
});

test("writeBalance updates the in-memory account state", () => {
  resetAccountState();
  writeBalance(500.0);
  assert.equal(readBalance(), 500.0);
});
