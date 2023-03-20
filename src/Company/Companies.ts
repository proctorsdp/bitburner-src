// Constructs all CompanyPosition objects using the metadata in data/companypositions.ts
import { companiesMetadata } from "./data/CompaniesMetadata";
import { Company, IConstructorParams } from "./Company";
import { Reviver } from "../utils/JSONReviver";
import { LocationName } from "../data/Enums";

export let Companies: Partial<Record<LocationName, Company>> = {};

function addCompany(params: IConstructorParams): void {
  if (Companies[params.name] != null) {
    console.warn(`Duplicate Company Position being defined: ${params.name}`);
  }
  Companies[params.name] = new Company(params);
}

// Used to initialize new Company objects for the Companies map
// Called when creating new game or after a prestige/reset
export function initCompanies(): void {
  // Save Old Company data for 'favor'
  const oldCompanies = Companies;

  // Re-construct all Companies
  Companies = {};
  companiesMetadata.forEach((e) => {
    addCompany(e);
  });

  // Reset data
  for (const company of Object.values(Companies)) {
    const companyName = company.name;
    const oldCompany = oldCompanies[companyName];
    if (!oldCompany) {
      // New game, so no OldCompanies data
      company.favor = 0;
    } else {
      company.favor = oldCompany.favor;
      if (isNaN(company.favor)) {
        company.favor = 0;
      }
    }
  }
}

// Used to load Companies map from a save
export function loadCompanies(saveString: string): void {
  Companies = JSON.parse(saveString, Reviver);
}
