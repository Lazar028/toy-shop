// ─── API Models (toy.pequla.com) ───────────────────────────────────────────

export interface AgeGroup {
  ageGroupId: number;
  name: string;
}

export interface ToyType {
  typeId: number;
  name: string;
}

export interface Toy {
  toyId: number;
  name: string;
  description: string;
  permalink: string;
  price: number;
  createdAt: string; // datum proizvodnje
  type: ToyType;
  ageGroup: AgeGroup;
  imageUrl?: string;
}

// ─── Local Models (auth, cart, reviews) ───────────────────────────────────

export type Gender = 'devojčica' | 'dečak' | 'svi';
export type OrderStatus = 'rezervisano' | 'pristiglo' | 'otkazano';

export interface Review {
  reviewId: string;
  toyId: number;
  userId: string;
  rating: number; // 1-5
  comment: string;
  author: string;
  createdAt: string;
}

export interface CartItem {
  cartItemId: string;
  toy: Toy;
  status: OrderStatus;
  gender: Gender;
  rating?: number; // only when status = 'pristiglo'
  addedAt: string;
}

export interface UserProfile {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  favoriteToyTypes: string[];
  password: string; // hashed locally (base64 for prototype)
  cart: CartItem[];
}

// ─── Search / Filter ───────────────────────────────────────────────────────

export interface ToyFilter {
  name?: string;
  description?: string;
  typeId?: number;
  ageGroupId?: number;
  gender?: Gender;
  minPrice?: number;
  maxPrice?: number;
  dateFrom?: string;
  dateTo?: string;
  minRating?: number;
}
