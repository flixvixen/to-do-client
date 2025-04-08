import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showError, setShowError] = useState(false);

  const handleLogin = async () => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_ENDPOINT_URL}/check-user`, { username, password });
      if (response.data.exist) {
        setShowError(false);
        navigate("/todo"); 
      } else {
        setShowError(true);
      }
    } catch (error) {
      console.error("Login error:", error);
      setShowError(true);
    }
  };

  return (
    <div className="w-screen h-screen flex justify-center items-center bg-blue-300">
      <div className="w-xl h-[550px] bg-blue-900 flex flex-col justify-center p-8 gap-6 rounded-3xl shadow-lg border-4 border-blue-500">
        <h1 className="text-4xl text-center font-bold text-blue-100 mb-2">🧵 LOGIN 🧵</h1>
        
        {showError && (
          <div className="bg-blue-500 text-white p-3 rounded-lg font-medium shadow-md">
            Invalid username or password
          </div>
        )}
        
        <div className="flex flex-col">
          <label htmlFor="username" className="text-blue-200 font-medium">Username:</label>
          <input 
            type="text" 
            className="outline-none border-2 border-blue-400 p-2 rounded-xl focus:ring-2 focus:ring-blue-500 bg-blue-100"
            onChange={(e) => setUsername(e.target.value)} 
          />
        </div>
        
        <div className="flex flex-col">
          <label htmlFor="password" className="text-blue-200 font-medium">Password:</label>
          <input 
            type="password" 
            className="outline-none border-2 border-blue-400 p-2 rounded-xl focus:ring-2 focus:ring-blue-500 bg-blue-100"
            onChange={(e) => setPassword(e.target.value)} 
          />
        </div>
        
        <button 
          type="button" 
          onClick={handleLogin} 
          className="bg-blue-600 text-white py-3 font-medium text-xl rounded-xl shadow-md hover:bg-blue-700"
        >
           LOGIN 
        </button>
      </div>
    </div>
  );
  
  }
  
  export default Login;
  