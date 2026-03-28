# MegaAmp Player

## Current State
All controls are partially wired to Web Audio API and RoutingContext. However, handleHighMid and handleBass handlers don't call fireRoute or triggerVerifyRef. The WebApiLock verifies every 1000ms with a 500ms chain heartbeat. The RoutingContext chainblock re-locks every 800ms. Volume handlers call triggerVerifyRef but not fireRoute. Generator toggle and merge switch don't fire route or verify.

## Requested Changes (Diff)

### Add
- All control handlers (handleHighMid, handleBass, handleEqBand, handleBassEqBand) now call both fireRoute AND triggerVerifyRef on every change
- Generator toggle fires route + triggerVerify
- Merge switch fires route + triggerVerify
- Volume increase/decrease now also fires route
- Full settings auto-save to localStorage on every state change

### Modify
- WebApiLock: verify interval tightened to 500ms, chain heartbeat to 250ms
- RoutingContext: chainblock heartbeat tightened to 500ms
- App.tsx: all handlers wired to both fireRoute and triggerVerifyRef

### Remove
Nothing removed.

## Implementation Plan
1. Tighten WebApiLock intervals (500ms verify, 250ms heartbeat)
2. Tighten RoutingContext chainblock heartbeat to 500ms
3. Update App.tsx handlers to fire both routing and verify on every change
4. Persist all settings to localStorage on every state change
