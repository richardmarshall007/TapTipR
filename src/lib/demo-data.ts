import type { EmployeeOnShift, Workplace } from "./types";

export const DEMO_WORKPLACES: Workplace[] = [
  {
    id: "11111111-1111-1111-1111-111111111101",
    name: "Starbucks",
    slug: "starbucks",
    businessCode: "SBUX-DEMO",
    logoEmoji: "☕",
  },
  {
    id: "11111111-1111-1111-1111-111111111102",
    name: "Blue Bottle Coffee",
    slug: "blue-bottle",
    businessCode: "BB-DEMO",
    logoEmoji: "🫘",
  },
];

export const DEMO_EMPLOYEES: EmployeeOnShift[] = [
  {
    id: "22222222-2222-2222-2222-222222222201",
    name: "Maria Santos",
    employeeCode: "MARIA-7K2P",
    verified: true,
  },
  {
    id: "22222222-2222-2222-2222-222222222202",
    name: "James Chen",
    employeeCode: "JAMES-4M9X",
    verified: true,
  },
  {
    id: "22222222-2222-2222-2222-222222222203",
    name: "Priya Patel",
    employeeCode: "PRIYA-2N8Q",
    verified: false,
  },
];

export function getWorkplaceById(id: string): Workplace | undefined {
  return DEMO_WORKPLACES.find((w) => w.id === id);
}

export function getWorkplaceByCode(code: string): Workplace | undefined {
  return DEMO_WORKPLACES.find(
    (w) => w.businessCode.toLowerCase() === code.toLowerCase() || w.slug === code
  );
}

export function getDemoEmployeeByCode(
  code: string
): (EmployeeOnShift & { workplace: Workplace }) | undefined {
  const employee = DEMO_EMPLOYEES.find(
    (e) => e.employeeCode.toLowerCase() === code.toLowerCase()
  );
  if (!employee) return undefined;
  return { ...employee, workplace: DEMO_WORKPLACES[0] };
}

export function getEmployeesForWorkplace(workplaceId: string): EmployeeOnShift[] {
  if (
    workplaceId === "11111111-1111-1111-1111-111111111101" ||
    workplaceId === "11111111-1111-1111-1111-111111111102" ||
    workplaceId === "wp-starbucks" ||
    workplaceId === "wp-bluebottle"
  ) {
    return DEMO_EMPLOYEES;
  }
  return [];
}
