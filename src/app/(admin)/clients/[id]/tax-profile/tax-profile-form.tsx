"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { saveTaxProfileAction } from "./actions";

type FilingHistoryStatus =
  | "NEW_FILER"
  | "EXISTING_FILER"
  | "PREVIOUS_RETURN_UNAVAILABLE";

type IncomeSourceType =
  | "SALARY_EMPLOYMENT"
  | "FREELANCE_PROFESSIONAL"
  | "BUSINESS"
  | "RENTAL_PROPERTY"
  | "CAPITAL_GAINS"
  | "INVESTMENT_PROFIT"
  | "AGRICULTURAL"
  | "FOREIGN"
  | "OTHER";

type AssetType =
  | "BANK_ACCOUNT"
  | "CASH_FINANCIAL_ASSETS"
  | "IMMOVABLE_PROPERTY"
  | "VEHICLE"
  | "INVESTMENTS_SECURITIES"
  | "BUSINESS_ASSETS"
  | "FOREIGN_ASSETS"
  | "OTHER_ASSETS";

type TaxEvidenceType =
  | "EMPLOYER_WITHHOLDING"
  | "BANK_WITHHOLDING"
  | "PROPERTY_TAX_WITHHOLDING"
  | "VEHICLE_TAX"
  | "BUSINESS_CUSTOMER_WITHHOLDING"
  | "ADVANCE_TAX_PAYMENT"
  | "OTHER_TAX_DEDUCTED";

const incomeSourceOptions: {
  value: IncomeSourceType;
  label: string;
}[] = [
  {
    value: "SALARY_EMPLOYMENT",
    label: "Salary / Employment",
  },
  {
    value: "FREELANCE_PROFESSIONAL",
    label: "Freelance / Professional",
  },
  {
    value: "BUSINESS",
    label: "Business / Sole Proprietor",
  },
  {
    value: "RENTAL_PROPERTY",
    label: "Rental / Property",
  },
  {
    value: "CAPITAL_GAINS",
    label: "Capital Gains",
  },
  {
    value: "INVESTMENT_PROFIT",
    label: "Investment / Profit on Debt",
  },
  {
    value: "AGRICULTURAL",
    label: "Agricultural Income",
  },
  {
    value: "FOREIGN",
    label: "Foreign Income",
  },
  {
    value: "OTHER",
    label: "Other Income",
  },
];

const assetOptions: {
  value: AssetType;
  label: string;
}[] = [
  {
    value: "BANK_ACCOUNT",
    label: "Bank Accounts",
  },
  {
    value: "CASH_FINANCIAL_ASSETS",
    label: "Cash / Other Financial Assets",
  },
  {
    value: "IMMOVABLE_PROPERTY",
    label: "Immovable Property",
  },
  {
    value: "VEHICLE",
    label: "Vehicles",
  },
  {
    value: "INVESTMENTS_SECURITIES",
    label: "Investments / Securities",
  },
  {
    value: "BUSINESS_ASSETS",
    label: "Business Assets",
  },
  {
    value: "FOREIGN_ASSETS",
    label: "Foreign Assets",
  },
  {
    value: "OTHER_ASSETS",
    label: "Other Assets",
  },
];

const taxEvidenceOptions: {
  value: TaxEvidenceType;
  label: string;
}[] = [
  {
    value: "EMPLOYER_WITHHOLDING",
    label: "Employer Withholding",
  },
  {
    value: "BANK_WITHHOLDING",
    label: "Bank / Profit-on-Debt Withholding",
  },
  {
    value: "PROPERTY_TAX_WITHHOLDING",
    label: "Property Tax / Withholding",
  },
  {
    value: "VEHICLE_TAX",
    label: "Vehicle Tax",
  },
  {
    value: "BUSINESS_CUSTOMER_WITHHOLDING",
    label: "Business / Customer Withholding",
  },
  {
    value: "ADVANCE_TAX_PAYMENT",
    label: "Advance Tax Payments",
  },
  {
    value: "OTHER_TAX_DEDUCTED",
    label: "Other Tax Deducted / Collected",
  },
];

type TaxProfileInitialData = {
  filingHistoryStatus: FilingHistoryStatus;
  previousTaxReturnAvailable: boolean;
  previousWealthStatementAvailable: boolean;

  incomeSources: IncomeSourceType[];

  declaredIncomeAmounts?: Partial<
    Record<IncomeSourceType, number | null>
  >;

  assetTypes: AssetType[];
  taxEvidenceTypes: TaxEvidenceType[];

  hasLiabilities: boolean;
  hasMultipleEmployers: boolean;

  openingWealth?: number | null;
  wealthAdditions?: number | null;
  wealthReductions?: number | null;
  closingWealth?: number | null;

  internalNotes: string;
};

type TaxProfileFormProps = {
  clientId: string;
  initialData?: TaxProfileInitialData | null;
};

function initialMoneyValue(
  value: number | null | undefined,
) {
  return value === null || value === undefined
    ? ""
    : String(value);
}

function parseOptionalMoney(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  const parsed = Number(trimmed);

  return Number.isFinite(parsed) ? parsed : null;
}

export function TaxProfileForm({
  clientId,
  initialData,
}: TaxProfileFormProps) {
  const router = useRouter();

  const [filingHistoryStatus, setFilingHistoryStatus] =
    useState<FilingHistoryStatus>(
      initialData?.filingHistoryStatus ?? "NEW_FILER",
    );

  const [
    previousTaxReturnAvailable,
    setPreviousTaxReturnAvailable,
  ] = useState(
    initialData?.previousTaxReturnAvailable ?? false,
  );

  const [
    previousWealthStatementAvailable,
    setPreviousWealthStatementAvailable,
  ] = useState(
    initialData?.previousWealthStatementAvailable ??
      false,
  );

  const [incomeSources, setIncomeSources] = useState<
    IncomeSourceType[]
  >(initialData?.incomeSources ?? []);

  const [
    declaredIncomeAmounts,
    setDeclaredIncomeAmounts,
  ] = useState<
    Partial<Record<IncomeSourceType, string>>
  >(() => {
    const values: Partial<
      Record<IncomeSourceType, string>
    > = {};

    for (const source of incomeSourceOptions) {
      const amount =
        initialData?.declaredIncomeAmounts?.[
          source.value
        ];

      if (
        amount !== null &&
        amount !== undefined
      ) {
        values[source.value] = String(amount);
      }
    }

    return values;
  });

  const [assetTypes, setAssetTypes] = useState<
    AssetType[]
  >(initialData?.assetTypes ?? []);

  const [taxEvidenceTypes, setTaxEvidenceTypes] =
    useState<TaxEvidenceType[]>(
      initialData?.taxEvidenceTypes ?? [],
    );

  const [hasLiabilities, setHasLiabilities] =
    useState(
      initialData?.hasLiabilities ?? false,
    );

  const [
    hasMultipleEmployers,
    setHasMultipleEmployers,
  ] = useState(
    initialData?.hasMultipleEmployers ?? false,
  );

  const [openingWealth, setOpeningWealth] =
    useState(
      initialMoneyValue(initialData?.openingWealth),
    );

  const [wealthAdditions, setWealthAdditions] =
    useState(
      initialMoneyValue(initialData?.wealthAdditions),
    );

  const [wealthReductions, setWealthReductions] =
    useState(
      initialMoneyValue(initialData?.wealthReductions),
    );

  const [closingWealth, setClosingWealth] =
    useState(
      initialMoneyValue(initialData?.closingWealth),
    );

  const [internalNotes, setInternalNotes] =
    useState(initialData?.internalNotes ?? "");

  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  function toggleValue<T extends string>(
    currentValues: T[],
    value: T,
    setter: React.Dispatch<
      React.SetStateAction<T[]>
    >,
  ) {
    setter(
      currentValues.includes(value)
        ? currentValues.filter(
            (currentValue) =>
              currentValue !== value,
          )
        : [...currentValues, value],
    );
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setIsSaving(true);
    setMessage("");

    const result = await saveTaxProfileAction(
      clientId,
      {
        filingHistoryStatus,
        previousTaxReturnAvailable,
        previousWealthStatementAvailable,

        incomeSources,

        declaredIncomeAmounts:
          incomeSources.map((type) => {
            const rawValue =
              declaredIncomeAmounts[type]?.trim();

            return {
              type,
              declaredAmount:
                rawValue &&
                Number.isFinite(Number(rawValue))
                  ? Number(rawValue)
                  : null,
            };
          }),

        assetTypes,
        taxEvidenceTypes,

        hasLiabilities,
        hasMultipleEmployers,

        openingWealth:
          parseOptionalMoney(openingWealth),

        wealthAdditions:
          parseOptionalMoney(wealthAdditions),

        wealthReductions:
          parseOptionalMoney(wealthReductions),

        closingWealth:
          parseOptionalMoney(closingWealth),

        internalNotes,
      },
    );

    setIsSaving(false);
    setMessage(result.message);

    if (result.success) {
      router.push(`/clients/${clientId}`);
      router.refresh();
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-8"
    >
      <section>
        <h2 className="text-lg font-semibold">
          1. Filing History
        </h2>

        <div className="mt-3 space-y-2">
          <label className="block">
            <input
              type="radio"
              name="filingHistoryStatus"
              checked={
                filingHistoryStatus ===
                "NEW_FILER"
              }
              onChange={() =>
                setFilingHistoryStatus(
                  "NEW_FILER",
                )
              }
            />{" "}
            New Filer
          </label>

          <label className="block">
            <input
              type="radio"
              name="filingHistoryStatus"
              checked={
                filingHistoryStatus ===
                "EXISTING_FILER"
              }
              onChange={() =>
                setFilingHistoryStatus(
                  "EXISTING_FILER",
                )
              }
            />{" "}
            Existing Filer
          </label>

          <label className="block">
            <input
              type="radio"
              name="filingHistoryStatus"
              checked={
                filingHistoryStatus ===
                "PREVIOUS_RETURN_UNAVAILABLE"
              }
              onChange={() =>
                setFilingHistoryStatus(
                  "PREVIOUS_RETURN_UNAVAILABLE",
                )
              }
            />{" "}
            Previous Return Unavailable
          </label>
        </div>

        <div className="mt-4 space-y-2">
          <label className="block">
            <input
              type="checkbox"
              checked={
                previousTaxReturnAvailable
              }
              onChange={(event) =>
                setPreviousTaxReturnAvailable(
                  event.target.checked,
                )
              }
            />{" "}
            Previous Tax Return Available
          </label>

          <label className="block">
            <input
              type="checkbox"
              checked={
                previousWealthStatementAvailable
              }
              onChange={(event) =>
                setPreviousWealthStatementAvailable(
                  event.target.checked,
                )
              }
            />{" "}
            Previous Wealth Statement Available
          </label>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">
          2. Sources of Income
        </h2>

        <div className="mt-3 space-y-2">
          {incomeSourceOptions.map((option) => {
            const selected =
              incomeSources.includes(
                option.value,
              );

            return (
              <div
                key={option.value}
                className="rounded-lg border p-3"
              >
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={() =>
                      toggleValue(
                        incomeSources,
                        option.value,
                        setIncomeSources,
                      )
                    }
                  />

                  <span>{option.label}</span>
                </label>

                {selected ? (
                  <div className="mt-3 max-w-sm">
                    <label
                      htmlFor={`declared-${option.value}`}
                      className="mb-1 block text-sm font-medium"
                    >
                      Declared annual amount (PKR)
                    </label>

                    <input
                      id={`declared-${option.value}`}
                      type="number"
                      min="0"
                      step="0.01"
                      inputMode="decimal"
                      value={
                        declaredIncomeAmounts[
                          option.value
                        ] ?? ""
                      }
                      onChange={(event) =>
                        setDeclaredIncomeAmounts(
                          (current) => ({
                            ...current,
                            [option.value]:
                              event.target.value,
                          }),
                        )
                      }
                      placeholder="Optional"
                      className="w-full rounded-md border px-3 py-2 text-sm"
                    />

                    <p className="mt-1 text-xs text-muted-foreground">
                      Optional. Used to compare
                      declared income with supporting
                      documents.
                    </p>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">
          3. Assets & Wealth
        </h2>

        <div className="mt-3 space-y-2">
          {assetOptions.map((option) => (
            <label
              key={option.value}
              className="block"
            >
              <input
                type="checkbox"
                checked={assetTypes.includes(
                  option.value,
                )}
                onChange={() =>
                  toggleValue(
                    assetTypes,
                    option.value,
                    setAssetTypes,
                  )
                }
              />{" "}
              {option.label}
            </label>
          ))}

          <label className="block">
            <input
              type="checkbox"
              checked={hasLiabilities}
              onChange={(event) =>
                setHasLiabilities(
                  event.target.checked,
                )
              }
            />{" "}
            Liabilities / Loans
          </label>
        </div>

        <div className="mt-6 rounded-lg border p-4">
          <div>
            <h3 className="font-semibold">
              Wealth Movement
            </h3>

            <p className="mt-1 text-sm text-muted-foreground">
              Optional preparation check. Enter all
              four values to compare expected closing
              wealth with the declared closing wealth.
            </p>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-sm font-medium">
                Opening wealth (PKR)
              </span>

              <input
                type="number"
                min="0"
                step="0.01"
                inputMode="decimal"
                value={openingWealth}
                onChange={(event) =>
                  setOpeningWealth(
                    event.target.value,
                  )
                }
                placeholder="Optional"
                className="w-full rounded-md border px-3 py-2 text-sm"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-medium">
                Wealth additions (PKR)
              </span>

              <input
                type="number"
                min="0"
                step="0.01"
                inputMode="decimal"
                value={wealthAdditions}
                onChange={(event) =>
                  setWealthAdditions(
                    event.target.value,
                  )
                }
                placeholder="Optional"
                className="w-full rounded-md border px-3 py-2 text-sm"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-medium">
                Wealth reductions (PKR)
              </span>

              <input
                type="number"
                min="0"
                step="0.01"
                inputMode="decimal"
                value={wealthReductions}
                onChange={(event) =>
                  setWealthReductions(
                    event.target.value,
                  )
                }
                placeholder="Optional"
                className="w-full rounded-md border px-3 py-2 text-sm"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-medium">
                Closing wealth (PKR)
              </span>

              <input
                type="number"
                min="0"
                step="0.01"
                inputMode="decimal"
                value={closingWealth}
                onChange={(event) =>
                  setClosingWealth(
                    event.target.value,
                  )
                }
                placeholder="Optional"
                className="w-full rounded-md border px-3 py-2 text-sm"
              />
            </label>
          </div>

          <p className="mt-4 text-xs text-muted-foreground">
            Expected closing wealth = opening wealth +
            additions - reductions.
          </p>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">
          4. Tax & Withholding
        </h2>

        <div className="mt-3 space-y-2">
          {taxEvidenceOptions.map(
            (option) => (
              <label
                key={option.value}
                className="block"
              >
                <input
                  type="checkbox"
                  checked={taxEvidenceTypes.includes(
                    option.value,
                  )}
                  onChange={() =>
                    toggleValue(
                      taxEvidenceTypes,
                      option.value,
                      setTaxEvidenceTypes,
                    )
                  }
                />{" "}
                {option.label}
              </label>
            ),
          )}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">
          5. Additional Information
        </h2>

        <label className="mt-3 block">
          <input
            type="checkbox"
            checked={hasMultipleEmployers}
            onChange={(event) =>
              setHasMultipleEmployers(
                event.target.checked,
              )
            }
          />{" "}
          Multiple Employers During Tax Year
        </label>
      </section>

      <section>
        <h2 className="text-lg font-semibold">
          6. Internal Practitioner Notes
        </h2>

        <textarea
          value={internalNotes}
          onChange={(event) =>
            setInternalNotes(
              event.target.value,
            )
          }
          rows={5}
          maxLength={2000}
          placeholder="Add internal notes about this client's tax profile..."
          className="mt-3 w-full max-w-2xl border p-2"
        />
      </section>

      {message && (
        <p className="text-sm">{message}</p>
      )}

      <button
  type="submit"
  disabled={isSaving}
  className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 disabled:pointer-events-none disabled:opacity-50"
>
  {isSaving
    ? "Saving..."
    : initialData
      ? "Update Tax Profile"
      : "Save Tax Profile"}
</button>
    </form>
  );
}