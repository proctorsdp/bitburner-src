import type { Member } from "../../types";
import { NetscriptContext } from "../../Netscript/APIWrapper";
import { assertString, helpers } from "../../Netscript/NetscriptHelpers";
import { getRandomInt } from "./getRandomInt";

import * as baseEnums from "../../data/Enums";
import * as bladeEnums from "../../Bladeburner/data/Enums";
import * as corpEnums from "../../Corporation/data/Enums";
import * as factionEnums from "../../Faction/data/Enums";
import * as gangEnums from "../../Gang/data/Enums";
import * as hiddenEnums from "../../data/HiddenEnums";
const allEnums = {
  ...baseEnums,
  ...bladeEnums,
  ...corpEnums,
  ...factionEnums,
  ...gangEnums,
  ...hiddenEnums,
};

class EnumHelper<EnumObj extends object, EnumMember extends Member<EnumObj> & string> {
  name: string; // Name, for including in error text
  reverseLookup: Record<EnumMember, 1>; // For quick isMember typecheck
  fuzzyLookup: Partial<Record<string, EnumMember>>;
  array: Array<EnumMember>;
  constructor(obj: EnumObj, name: string) {
    this.name = name;
    this.reverseLookup = {} as Record<EnumMember, 1>;
    this.fuzzyLookup = {};
    this.array = Object.values(obj);
    for (const val of this.array) {
      this.reverseLookup[val] = 1;
      this.fuzzyLookup[val.toLowerCase().replace(/[ -]+/g, "")] = val;
    }
  }
  // Check if a provided string is a valid enum member
  isMember(toValidate: string): toValidate is EnumMember {
    return toValidate in this.reverseLookup;
  }
  nsGetMember(ctx: NetscriptContext, argName: string, toValidate: unknown): EnumMember {
    assertString(ctx, argName, toValidate);
    if (toValidate in this.reverseLookup) return toValidate as EnumMember;
    throw helpers.makeRuntimeErrorMsg(
      ctx,
      `Argument ${argName} should be a ${
        this.name
      } enum member.\nProvided value: "${toValidate}".\nAllowable values: ${this.array
        .map((val) => `"${val}"`)
        .join(", ")}`,
    );
  }
  match(input: string): EnumMember | undefined {
    return input in this.reverseLookup ? (input as EnumMember) : undefined;
  }
  // For safe-loading a potential API break name change, always provides a valid enum member.
  fuzzyMatch(input: string): EnumMember {
    return this.fuzzyLookup[input.toLowerCase().replace(/[ -]+/g, "")] ?? this.array[0];
  }
  // Get a random enum member
  random() {
    const index = getRandomInt(0, this.array.length - 1);
    return this.array[index];
  }
}

const enumHelpers = new Map();
// Ensure all enums get helpers assigned to them.
Object.entries(allEnums).forEach(([enumName, enumObj]) => {
  enumHelpers.set(enumObj, new EnumHelper(enumObj, enumName));
});

// This function is just adding types to enumHelpers.get
export const getEnumHelper: <EnumObj extends object, EnumMember extends Member<EnumObj> & string>(
  // This type for obj ensures a compiletime error if we try getting a helper for an enum that's not part of allEnums.
  obj: EnumObj & Member<typeof allEnums>,
) => EnumHelper<EnumObj, EnumMember> = enumHelpers.get.bind(enumHelpers);

// Not sure if this is useful, or if allEnums would get garbage collected at this point anyway
for (const key in allEnums) delete allEnums[key as keyof typeof allEnums];
