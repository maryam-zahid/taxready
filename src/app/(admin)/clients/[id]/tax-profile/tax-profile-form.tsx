"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Banknote,
  BriefcaseBusiness,
  Building2,
  Check,
  ChevronRight,
  CircleDollarSign,
  FileCheck2,
  FileText,
  Landmark,
  NotebookPen,
  Save,
  UserRoundCheck,
  WalletCards,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
      className="space-y-4"
    >
      {/* Filing history */}
      <ProfileSection
        number="01"
        title="Filing History"
        description="Set the client's filing history and indicate whether prior records are available."
        icon={FileText}
      >
        <div className="grid gap-3 lg:grid-cols-3">
          <ChoiceCard
            type="radio"
            name="filingHistoryStatus"
            checked={
              filingHistoryStatus === "NEW_FILER"
            }
            onChange={() =>
              setFilingHistoryStatus("NEW_FILER")
            }
            title="New Filer"
            description="No previous filing history."
          />

          <ChoiceCard
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
            title="Existing Filer"
            description="Previous filing history exists."
          />

          <ChoiceCard
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
            title="Previous Return Unavailable"
            description="Prior return cannot be provided."
          />
        </div>

        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <CompactCheck
            checked={previousTaxReturnAvailable}
            onChange={(checked) =>
              setPreviousTaxReturnAvailable(
                checked,
              )
            }
            label="Previous Tax Return Available"
          />

          <CompactCheck
            checked={
              previousWealthStatementAvailable
            }
            onChange={(checked) =>
              setPreviousWealthStatementAvailable(
                checked,
              )
            }
            label="Previous Wealth Statement Available"
          />
        </div>
      </ProfileSection>

      {/* Income */}
      <ProfileSection
        number="02"
        title="Sources of Income"
        description="Select all applicable income sources. Add declared annual amounts where available."
        icon={CircleDollarSign}
      >
        <div className="grid gap-3 lg:grid-cols-2">
          {incomeSourceOptions.map((option) => {
            const selected =
              incomeSources.includes(
                option.value,
              );

            return (
              <div
                key={option.value}
                className={[
                  "rounded-xl border p-4 transition-colors",
                  selected
                    ? "border-primary/30 bg-primary/[0.035]"
                    : "bg-white hover:bg-muted/20",
                ].join(" ")}
              >
                <label className="flex cursor-pointer items-center gap-3">
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
                    className="size-4 rounded border-input accent-primary"
                  />

                  <span className="min-w-0 flex-1 text-sm font-medium text-foreground">
                    {option.label}
                  </span>

                  {selected && (
                    <span className="flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <Check className="size-3.5" />
                    </span>
                  )}
                </label>

                {selected ? (
                  <div className="mt-4 border-t pt-3">
                    <label
                      htmlFor={`declared-${option.value}`}
                      className="mb-1.5 block text-xs font-medium text-muted-foreground"
                    >
                      Declared annual amount (PKR)
                    </label>

                    <Input
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
                      placeholder="Optional amount"
                      className="h-10 max-w-sm"
                    />

                    <p className="mt-1.5 text-xs leading-5 text-muted-foreground">
                      Used for basic reconciliation with
                      supported documents.
                    </p>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </ProfileSection>

      {/* Assets */}
      <ProfileSection
        number="03"
        title="Assets & Wealth"
        description="Identify applicable assets and record optional wealth movement values."
        icon={Landmark}
      >
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {assetOptions.map((option) => (
            <CompactCheck
              key={option.value}
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
              label={option.label}
            />
          ))}

          <CompactCheck
            checked={hasLiabilities}
            onChange={setHasLiabilities}
            label="Liabilities / Loans"
          />
        </div>

        <div className="mt-5 overflow-hidden rounded-xl border">
          <div className="border-b bg-muted/20 px-4 py-3.5 sm:px-5">
            <div className="flex items-start gap-3">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <WalletCards className="size-4" />
              </span>

              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  Wealth Movement
                </h3>

                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  Optional. Enter all four values to
                  compare expected closing wealth with
                  declared closing wealth.
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 p-4 sm:grid-cols-2 sm:p-5 lg:grid-cols-4">
            <MoneyField
              label="Opening wealth"
              value={openingWealth}
              onChange={setOpeningWealth}
            />

            <MoneyField
              label="Wealth additions"
              value={wealthAdditions}
              onChange={setWealthAdditions}
            />

            <MoneyField
              label="Wealth reductions"
              value={wealthReductions}
              onChange={setWealthReductions}
            />

            <MoneyField
              label="Closing wealth"
              value={closingWealth}
              onChange={setClosingWealth}
            />
          </div>

          <div className="border-t bg-muted/10 px-4 py-3 sm:px-5">
            <p className="text-xs text-muted-foreground">
              Expected closing wealth = opening wealth +
              additions − reductions.
            </p>
          </div>
        </div>
      </ProfileSection>

      {/* Withholding */}
      <ProfileSection
        number="04"
        title="Tax & Withholding"
        description="Select the tax deduction or withholding evidence relevant to this client."
        icon={Banknote}
      >
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {taxEvidenceOptions.map((option) => (
            <CompactCheck
              key={option.value}
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
              label={option.label}
            />
          ))}
        </div>
      </ProfileSection>

      {/* Additional */}
      <ProfileSection
        number="05"
        title="Additional Information"
        description="Capture additional circumstances that affect preparation requirements."
        icon={UserRoundCheck}
      >
        <div className="max-w-xl">
          <CompactCheck
            checked={hasMultipleEmployers}
            onChange={setHasMultipleEmployers}
            label="Multiple Employers During Tax Year"
          />
        </div>
      </ProfileSection>

      {/* Notes */}
      <ProfileSection
        number="06"
        title="Internal Notes"
        description="Add internal context for this client's preparation. These notes are not client-facing."
        icon={NotebookPen}
      >
        <textarea
          value={internalNotes}
          onChange={(event) =>
            setInternalNotes(
              event.target.value,
            )
          }
          rows={4}
          maxLength={2000}
          placeholder="Add internal notes about this client's tax profile..."
          className="min-h-[110px] w-full resize-y rounded-xl border border-input bg-background px-3.5 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/15"
        />

        <p className="mt-1.5 text-right text-xs text-muted-foreground">
          {internalNotes.length} / 2000
        </p>
      </ProfileSection>

      {/* Save */}
      <div className="sticky bottom-3 z-20 rounded-2xl border bg-white/95 p-3 shadow-[0_10px_35px_rgba(15,23,42,0.10)] backdrop-blur sm:flex sm:items-center sm:justify-between sm:gap-4">
        <div className="min-w-0">
          {message ? (
            <p className="text-sm font-medium text-foreground">
              {message}
            </p>
          ) : (
            <>
              <p className="text-sm font-semibold text-foreground">
                Tax profile
              </p>

              <p className="mt-0.5 text-xs text-muted-foreground">
                Save changes to refresh preparation
                requirements and reconciliation.
              </p>
            </>
          )}
        </div>

        <Button
          type="submit"
          disabled={isSaving}
          className="mt-3 h-10 w-full rounded-xl px-5 shadow-sm sm:mt-0 sm:w-auto"
        >
          {isSaving ? (
            "Saving..."
          ) : (
            <>
              <Save className="size-4" />
              {initialData
                ? "Update Tax Profile"
                : "Save Tax Profile"}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

function ProfileSection({
  number,
  title,
  description,
  icon: Icon,
  children,
}: {
  number: string;
  title: string;
  description: string;
  icon: typeof FileText;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border bg-white shadow-sm">
      <div className="flex items-start gap-3 border-b bg-muted/[0.18] px-5 py-4 sm:px-6">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="size-[17px]" />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold tracking-[0.08em] text-primary">
              {number}
            </span>

            <ChevronRight className="size-3 text-muted-foreground" />

            <h2 className="text-base font-semibold text-foreground">
              {title}
            </h2>
          </div>

          <p className="mt-1 text-sm leading-5 text-muted-foreground">
            {description}
          </p>
        </div>
      </div>

      <div className="p-4 sm:p-5 lg:p-6">
        {children}
      </div>
    </section>
  );
}

function ChoiceCard({
  type,
  name,
  checked,
  onChange,
  title,
  description,
}: {
  type: "radio";
  name: string;
  checked: boolean;
  onChange: () => void;
  title: string;
  description: string;
}) {
  return (
    <label
      className={[
        "flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors",
        checked
          ? "border-primary/35 bg-primary/[0.04]"
          : "bg-white hover:bg-muted/20",
      ].join(" ")}
    >
      <input
        type={type}
        name={name}
        checked={checked}
        onChange={onChange}
        className="mt-0.5 size-4 accent-primary"
      />

      <span className="min-w-0">
        <span className="block text-sm font-semibold text-foreground">
          {title}
        </span>

        <span className="mt-1 block text-xs leading-5 text-muted-foreground">
          {description}
        </span>
      </span>
    </label>
  );
}

function CompactCheck({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}) {
  return (
    <label
      className={[
        "flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border px-3.5 py-2.5 transition-colors",
        checked
          ? "border-primary/30 bg-primary/[0.035]"
          : "bg-white hover:bg-muted/20",
      ].join(" ")}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) =>
          onChange(event.target.checked)
        }
        className="size-4 shrink-0 rounded border-input accent-primary"
      />

      <span className="min-w-0 flex-1 text-sm font-medium text-foreground">
        {label}
      </span>

      {checked && (
        <Check className="size-4 shrink-0 text-primary" />
      )}
    </label>
  );
}

function MoneyField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-muted-foreground">
        {label} (PKR)
      </span>

      <Input
        type="number"
        min="0"
        step="0.01"
        inputMode="decimal"
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        placeholder="Optional"
        className="h-10"
      />
    </label>
  );
}