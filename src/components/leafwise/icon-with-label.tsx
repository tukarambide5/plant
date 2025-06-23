import type { LucideProps } from 'lucide-react';
import type { ForwardRefExoticComponent, RefAttributes } from 'react';

type IconWithLabelProps = {
  icon: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>;
  label: string;
  value: string;
};

export default function IconWithLabel({ icon: Icon, label, value }: IconWithLabelProps) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex-shrink-0 mt-1">
        <Icon className="h-5 w-5 text-accent" />
      </div>
      <div>
        <p className="font-semibold text-sm text-foreground">{label}</p>
        <p className="text-sm text-muted-foreground">{value}</p>
      </div>
    </div>
  );
}
