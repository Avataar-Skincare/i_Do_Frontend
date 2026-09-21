import { Note } from "@/components/ui/Note";
import { SIZES } from "@/lib/content/product";
import { SIZING_CAUTION } from "@/lib/content/sizing";

const mm = (value: number) => `${Number(value.toFixed(1))} mm`;

export function SizeChart() {
  return (
    <div>
      <div className="bg-surface border border-line rounded-lg overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              {["US", "Circumference", "Inner Ø"].map((h) => (
                <th
                  key={h}
                  className="font-mono text-[0.68rem] tracking-[0.08em] uppercase text-muted font-medium text-center py-4 px-2.5"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SIZES.map((size) => (
              <tr key={size.us} className="border-t border-line">
                <td className="text-center font-semibold py-3 px-2.5">{size.us}</td>
                <td className="text-center py-3 px-2.5">{mm(size.circ)}</td>
                <td className="text-center py-3 px-2.5">{mm(size.id)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4.5">
        <Note tone="sage" icon="heart">
          {SIZING_CAUTION}
        </Note>
      </div>
    </div>
  );
}
