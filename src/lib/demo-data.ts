import type { EmployeeOnShift, Workplace } from "./types";

export const DEMO_WORKPLACES: Workplace[] = [
  {
    id: "wp-starbucks",
    name: "Starbucks",
    slug: "starbucks",
    businessCode: "SBUX-DEMO",
    logoEmoji: "☕",
  },
  {
    id: "wp-bluebottle",
    name: "Blue Bottle Coffee",
    slug: "blue-bottle",
    businessCode: "BB-DEMO",
    logoEmoji: "🫘",
  },
];

export const DEMO_EMPLOYEES: EmployeeOnShift[] = [
  {
    id: "emp-maria",
    name: "Maria Santos",
    employeeCode: "MARIA-7K2P",
    verified: true,
  },
  {
    id: "emp-james",
    name: "James Chen",
    employeeCode: "JAMES-4M9X",
    verified: true,
  },
  {
    id: "emp-priya",
    name: "Priya Patel",
    employeeCode: "PRIYA-2N8Q",
    verified: false,
  },
];

export function getWorkplaceByCode(code: string): Workplace | undefined {
  return DEMO_WORKPLACES.find(
    (w) => w.businessCode.toLowerCase() === code.toLowerCase() || w.slug === code
  );
}

export function getEmployeeByCode(code: string): (EmployeeOnShift & { workplace: Workplace }) | undefined {
  const employee = DEMO_EMPLOYEES.find(
    (e) => e.employeeCode.toLowerCase() === code.toLowerCase()
  );
  if (!employee) return undefined;
  return { ...employee, workplace: DEMO_WORKPLACES[0] };
}

export function getEmployeesForWorkplace(workplaceId: string): EmployeeOnShift[] {
  if (workplaceId === "wp-starbucks" || workplaceId === "wp-bluebottle") {
    return DEMO_EMPLOYEES;
  }
  return [];
}
