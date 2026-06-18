import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/select";
import { todayISO } from "@/lib/utils";

export function DateStatusFilters({ statusOptions, defaultDate = todayISO() }: { statusOptions?: Array<{ value: string; label: string }>; defaultDate?: string }) {
  return (
    <form className="mb-4 flex flex-col gap-2 md:flex-row">
      <Input name="date" type="date" defaultValue={defaultDate} className="md:w-48" />
      {statusOptions && (
        <NativeSelect name="status" className="md:w-48">
          <option value="">Todos os status</option>
          {statusOptions.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </NativeSelect>
      )}
      <Button variant="secondary">Filtrar</Button>
    </form>
  );
}
