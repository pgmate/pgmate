export interface Article {
  id: string;
  cdate: string;
  media: string;
  url: string;
  title: string;
  cover?: string | null;
  excerpt?: string | null;
  sources?: string[];
  tags?: string[];
}

export interface Filter {
  loading: boolean;
  tags: any[];
  sources: any[];
  type?: "tag" | "source";
  value?: string;
}
