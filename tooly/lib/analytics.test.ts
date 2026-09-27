import assert from "assert";
import { createCooldownTracker } from "./analytics";

let calls = 0;
let clock = 10_000;
const sendWithCooldown = createCooldownTracker(() => {
  calls += 1;
}, 750, () => clock);

assert.strictEqual(sendWithCooldown(), true, "첫 명시 동작은 전송한다");
clock += 100;
assert.strictEqual(sendWithCooldown(), false, "빠른 중복 동작은 전송하지 않는다");
clock += 651;
assert.strictEqual(sendWithCooldown(), true, "같은 값을 다시 명시 실행하면 새 동작으로 전송한다");
assert.strictEqual(calls, 2, "각 유효 행동의 payload만 큐에 넣는다");

console.log("✓ analytics action cooldown tracker");
