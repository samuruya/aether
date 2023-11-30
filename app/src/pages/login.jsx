import { Link } from "react-router-dom";
import { Alert, Button, Form, Row, Col, Stack} from "react-bootstrap";
import { AuthContext } from "../context/AuthContext";
import { useContext } from "react";

const Login = () => {

    const {loginUser, loginError, loginInfo, updateLoginInfo, isLoginLoading} = useContext(AuthContext)
    return ( 
    <div className="log-form">
        <Form onSubmit={loginUser} className="light-for-bc">
                <Stack gap={3}>
                    <h2>Login</h2>

                    <div>
                    <h3>Email</h3>
                    <Form.Control className="txtInput" type="text" placeholder="" 
                    onChange={(e) => updateLoginInfo({...loginInfo, email: e.target.value}) } />
                    </div>
                    <div>
                    <h3>Password</h3>
                    <Form.Control className="txtInput" type="password" placeholder="" 
                    onChange={(e) => updateLoginInfo({...loginInfo, password: e.target.value}) } />
                    </div>
                    <Button className="logger-btn btnInput" variant="primary" type="submit">
                        {isLoginLoading ? "Getting you in..." : "Login"}
                    </Button>
                    {
                        loginError?.error && 
                        <Alert variant="danger"><p>{loginError.message}</p></Alert>
                    }
                    <Link to="/Register">Im New</Link>
                </Stack>
        </Form>


    </div> 
    );
}
 
export default Login;