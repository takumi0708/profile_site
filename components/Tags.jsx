import { Badge } from "@/components/ui/badge";
export default function Tags({ tags = [] }) {
  return <div className="my-3 flex flex-wrap gap-2">{tags.map(tag => <Badge key={tag} variant="secondary">{tag}</Badge>)}</div>;
}
