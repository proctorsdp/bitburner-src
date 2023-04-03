import type { Corporation } from "../../src/Corporation/Corporation";
import { initForeignServers } from "../../src/Server/AllServers";
import { RunningScript } from "../../src/Script/RunningScript";
import { Script } from "../../src/Script/Script";
import { loadGame, saveObject } from "../../src/SaveObject";
import { Player } from "@player";
import { Factions, initFactions } from "../../src/Faction/Factions";
import { initAugmentations } from "../../src/Augmentation/AugmentationHelpers";
import { initPrograms } from "../../src/Programs/Programs";
import { Sleeve } from "../../src/PersonObjects/Sleeve/Sleeve";
import { SleeveCrimeWork } from "../../src/PersonObjects/Sleeve/Work/SleeveCrimeWork";
import { CrimeType, FactionWorkType } from "../../src/Enums";
import { joinFaction } from "../../src/Faction/FactionHelpers";
import { FactionWork } from "../../src/Work/FactionWork";
import { LiteratureNames } from "../../src/Literature/data/LiteratureNames";
import { NewIndustry } from "../../src/Corporation/Actions";
import { IndustryType } from "../../src/Corporation/data/Enums";
import { serverMetadata } from "../../src/Server/data/servers";
import { setPlayer } from "@player";
import { PlayerObject } from "../../src/PersonObjects/Player/PlayerObject";

describe("Savegame Format Continuity", () => {
  unrandomize();
  setupGeneral();
  setupPlayer();
  setupServers();

  // Calling getSaveString forces all individual parts of the saveObject to initialize.
  const saveString = saveObject.getSaveString();

  test("Overall Load/Save Continuity", () => {
    // Overall save string reliability check: load and resave, expect no change
    loadGame(saveString);
    expect(saveString).toEqual(saveObject.getSaveString());
  });
  test("Player Snapshot", () => {
    expect(JSON.parse(saveObject.PlayerSave)).toMatchSnapshot();
  });
  test("AllServers Snapshot", () => {
    expect(JSON.parse(saveObject.AllServersSave)).toMatchSnapshot();
  });
  test("Factions Snapshot", () => {
    expect(JSON.parse(saveObject.FactionsSave)).toMatchSnapshot();
  });
});

/** Remove randomness from savedata generation */
function unrandomize() {
  // Date info is used to initialize player identifier
  jest.useFakeTimers().setSystemTime(1681096047580);
  // Random variation is used by various game mechanics.
  let randomVal = 0;
  Math.random = () => (++randomVal % 100) / 100;
}

/** Setup functions that need to be performed before Player */
function setupGeneral() {
  initPrograms();
  initFactions();
  initAugmentations();
}

function setupPlayer() {
  // This has to be manually reperformed so that it happens after the time and Random overrides
  setPlayer(new PlayerObject());

  // Creates the home computer
  Player.init();

  // Bladeburner
  Player.startBladeburner();

  // Gang
  joinFaction(Factions["Slum Snakes"]);
  Player.startGang("Slum Snakes", false);

  // Corporation
  Player.startCorporation("MyCorp", true);
  NewIndustry(Player.corporation as Corporation, IndustryType.Restaurant, "Noodle Bar");

  // Faction + work
  joinFaction(Factions["New Tokyo"]);
  Player.startWork(
    new FactionWork({ faction: "New Tokyo", factionWorkType: FactionWorkType.hacking, singularity: true }),
  );

  Player.sourceFiles.push({ n: 10, lvl: 1 });
  Player.sleevesFromCovenant = 1;
  Player.sleeves.push(new Sleeve(), new Sleeve());
  Player.sleeves[0].startWork(new SleeveCrimeWork(CrimeType.homicide));
}

function setupServers() {
  // Home is already set up in SetupPlayer.
  // We will just keep 1 server each at network level 1 and 2 just so the test isn't gigantic.
  const home = Player.getHomeComputer();
  const keptServers = new Set(["n00dles", "zer0"]);
  for (let i = serverMetadata.length - 1; i >= 0; i--) {
    if (!keptServers.has(serverMetadata[i].hostname)) serverMetadata.splice(i, 1);
  }
  initForeignServers(home);
  // Add a script to home
  const script = new Script(
    "script.js",
    `/** @param {NS} ns */\nexport async function main(ns) {\n  return ns.asleep(1000000);\n}`,
    "home",
  );
  home.scripts.push(script);

  // Add associated runningscripts on home. The first one is temporary and should not be saved.
  const runningScripts = [new RunningScript(script, 1.6, ["temporary"]), new RunningScript(script, 1.6, ["permanent"])];
  runningScripts[0].temporary = true;
  runningScripts.forEach((runningScript) => home.runScript(runningScript));

  // Add a literature
  home.messages.push(LiteratureNames.HackersStartingHandbook);
}
