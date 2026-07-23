export type Category = {
  id: string;
  slug: string;
  name: string;
  nameIt: string;
  parentId?: string;
  children?: Category[];
  description?: string;
  image?: string;
  seoTitle?: string;
  seoDescription?: string;
  featured?: boolean;
  collection?: string;
};

export type NavigationItem = {
  label: string;
  href: string;
  children?: NavigationColumn[];
  featured?: NavigationFeatured[];
};

export type NavigationColumn = {
  title: string;
  items: NavigationLink[];
};

export type NavigationLink = {
  label: string;
  href: string;
  badge?: string;
};

export type NavigationFeatured = {
  title: string;
  href: string;
  image: string;
};
