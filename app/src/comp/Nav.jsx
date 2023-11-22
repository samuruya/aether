import { Stack } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const Nav = () => {
    const {user, logoutUser} = useContext(AuthContext)  
    return ( <>
        <Stack direction="horizontal" className="nav">
            <div className="nav-wrap">
                <div className="logo">
                
                </div>
                {
                user && (<>
                    <Link onClick={() => logoutUser()} className="log-btn log-out" to="/Login">Logout</Link>
                    </>)
                }
                {!user && (<>
                    <div className="log-btn">
                        <Link to='/Login'> Login </Link>
                        /
                        <Link to='/Register'> Register </Link>
                     </div>
                </>)}
            </div>
        </Stack>

    </> );
}
 
export default Nav;