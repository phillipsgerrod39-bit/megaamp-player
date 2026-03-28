import Iter "mo:core/Iter";
import Array "mo:core/Array";
import Map "mo:core/Map";
import Runtime "mo:core/Runtime";
import Order "mo:core/Order";
import Time "mo:core/Time";

actor {
  type EQBand = {
    frequency : Text;
    value : Int; // -12 to +12
  };

  type HighMidAmpSettings = {
    frequency : Nat; // 1000-2000Hz
    blocker1 : Bool;
    blocker2 : Bool;
    soundStageDistance : Nat; // 30-70
    kick : Nat;
    thump : Nat;
  };

  type BassAmpSettings = {
    omniField : Bool;
    bassCorrection : Nat;
    soundStageDistance : Nat;
  };

  type AppState = {
    masterVolume : Nat; // 1-1000
    sprPressure : Nat; // 100-200
    mergeSwitch : Bool;
    highMidAmpSettings : HighMidAmpSettings;
    bassAmpSettings : BassAmpSettings;
    eqBands : [EQBand];
    voiceDepth : Nat;
    speakerPushout : Nat;
  };

  type Slot = {
    name : Text;
    state : AppState;
    lastModified : Int;
  };

  module Slot {
    public func compare(slot1 : Slot, slot2 : Slot) : Order.Order {
      Text.compare(slot1.name, slot2.name);
    };
  };

  let slots = Map.empty<Nat, Slot>();
  let systemCleanLogs = Map.empty<Nat, Text>();
  var logCounter = 0;
  var lastSystemCleanTimestamp : Int = 0;

  public shared ({ caller }) func saveSlot(slotIndex : Nat, name : Text, state : AppState) : async () {
    if (slotIndex >= 5) { Runtime.trap("Invalid slot index") };
    let slot : Slot = {
      name;
      state;
      lastModified = Time.now();
    };
    slots.add(slotIndex, slot);
  };

  public query ({ caller }) func loadSlot(slotIndex : Nat) : async AppState {
    switch (slots.get(slotIndex)) {
      case (null) { Runtime.trap("Slot does not exist") };
      case (?slot) { slot.state };
    };
  };

  public query ({ caller }) func getSlots() : async [Slot] {
    slots.values().toArray().sort();
  };

  public shared ({ caller }) func deleteSlot(slotIndex : Nat) : async () {
    if (not slots.containsKey(slotIndex)) { Runtime.trap("Slot does not exist") };
    slots.remove(slotIndex);
  };

  public shared ({ caller }) func addSystemCleanLog(entry : Text) : async () {
    systemCleanLogs.add(logCounter, entry);
    logCounter += 1;
    lastSystemCleanTimestamp := Time.now();
  };

  public query ({ caller }) func getSystemCleanLogs() : async [Text] {
    systemCleanLogs.values().toArray();
  };

  public query ({ caller }) func getLastSystemCleanTimestamp() : async Int {
    lastSystemCleanTimestamp;
  };
};
