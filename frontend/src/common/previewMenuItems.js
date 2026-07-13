// Preview items shown only until the backend returns a real menu — automatically
// replaced once getMenuItems() actually returns something. Shared by the public
// QR ordering page and the staff Menu management page.
export const PREVIEW_MENU_ITEMS = [
  { id: 1, name: "Spring Rolls", price: 12.0, status: "available", category: { name: "Appetizers" }, description: "Crispy rolls with sweet chili dip", imageUrl: null },
  { id: 2, name: "Chicken Satay", price: 15.0, status: "available", category: { name: "Appetizers" }, description: "Grilled skewers with peanut sauce", imageUrl: null },
  { id: 3, name: "Nasi Lemak", price: 18.0, status: "available", category: { name: "Main Course" }, description: "Coconut rice with sambal, egg and anchovies", imageUrl: null },
  { id: 4, name: "Grilled Chicken Chop", price: 22.0, status: "unavailable", category: { name: "Main Course" }, description: "Chargrilled chicken with black pepper sauce", imageUrl: null },
  { id: 5, name: "Cendol", price: 8.0, status: "available", category: { name: "Desserts" }, description: "Shaved ice with palm sugar and coconut milk", imageUrl: null },
  { id: 6, name: "Teh Tarik", price: 5.0, status: "available", category: { name: "Drinks" }, description: "Frothy pulled milk tea", imageUrl: null },
  { id: 7, name: "Iced Lemon Tea", price: 6.0, status: "available", category: { name: "Drinks" }, description: "Refreshing chilled lemon tea", imageUrl: null },
];
