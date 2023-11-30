import { Stack } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const U = () => {
    const {user, logoutUser} = useContext(AuthContext) 
    return ( <> 
    <Link onClick={() => logoutUser()} className="log-btn log-out" to="/Login">Logout</Link>
     </> );
}
 
export default U;