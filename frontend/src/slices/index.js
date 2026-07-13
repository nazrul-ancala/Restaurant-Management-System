import { combineReducers } from "redux";

// Front
import LayoutReducer from "./layouts/reducer";

// Authentication
import LoginReducer from "./auth/login/reducer";

// Employees
import EmployeesReducer from "./employees/reducer";

// Orders
import OrdersReducer from "./orders/reducer";

const rootReducer = combineReducers({
    Layout: LayoutReducer,
    Login: LoginReducer,
    Employees: EmployeesReducer,
    Orders: OrdersReducer,
});

export default rootReducer;
