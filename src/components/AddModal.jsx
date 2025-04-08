import { useState } from "react";
import axios from "axios";

export default function AddModal({ hide, onTaskAdded }) {
    const [title, setTitle] = useState('');
    const [tasks, setTasks] = useState(['']);
    const [message, setMessage] = useState('');

    const addTask = () => setTasks([...tasks, ""]);
    const removeTask = (index) => setTasks(tasks.filter((_, i) => i !== index));

    const handleTaskChange = (index, value) => {
        const newTasks = [...tasks];
        newTasks[index] = value;
        setTasks(newTasks);
    };

    const handleSave = async () => {
        const loggedInUser = localStorage.getItem("username");
        
        if (!loggedInUser || !title.trim() || tasks.every(task => !task.trim())) {
            setMessage("❌ All fields are required!");
            return;
        }

        try {
            const response = await axios.post(`${process.env.REACT_APP_ENDPOINT_URL}/add-to-do`, {
                username: loggedInUser,
                title: title,
                lists: tasks.filter(task => task.trim() !== ""), // ✅ Fixing key name & ensuring no empty tasks
                status: false
            });

            if (response.data.success) {
                setMessage("✅ Successfully added!");
                if (onTaskAdded) {
                    onTaskAdded(response.data.newTitleId);
                }
                setTimeout(() => hide(), 1000);
            }
        } catch (error) {
            setMessage("❌ Error saving task!");
            console.error("Error saving task:", error);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-75 backdrop-blur-sm">
            <div className="relative w-[400px] bg-gray-800 p-6 rounded-3xl shadow-lg border-4 border-blue-500">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-2xl font-bold text-blue-300">📝 Add Task</h3>
                    <button onClick={hide} className="text-blue-400 hover:text-blue-500 text-xl">✖</button>
                </div>

                {message && (
                    <div className={`text-center text-sm font-semibold p-2 rounded-lg mb-3 ${
                        message.includes("✅") ? "text-green-700 bg-green-200" : "text-red-700 bg-red-200"
                    }`}>
                        {message}
                    </div>
                )}

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-blue-300">Task Title</label>
                        <input 
                            onChange={(e) => setTitle(e.target.value)} 
                            type="text" 
                            className="w-full mt-1 p-2 border border-blue-400 rounded-xl shadow-sm focus:outline-none bg-gray-700 text-white focus:ring-blue-500" 
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-blue-300">Task List</label>
                        <div className="space-y-2">
                            {tasks.map((task, index) => (
                                <div key={index} className="flex items-center space-x-2">
                                    <input 
                                        type="text" 
                                        value={task} 
                                        onChange={(e) => handleTaskChange(index, e.target.value)} 
                                        className="p-2 border border-blue-400 rounded-xl w-full bg-gray-700 text-white" 
                                        placeholder={`Task ${index + 1}`} 
                                    />
                                    {tasks.length > 1 && (
                                        <button onClick={() => removeTask(index)} className="px-3 py-2 bg-red-400 text-white rounded-xl hover:bg-red-500">
                                            Delete
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <button onClick={addTask} className="mb-4 w-full px-4 py-2 bg-blue-400 text-white rounded-xl hover:bg-blue-500">
                        ➕ Add Task
                    </button>
                    <button onClick={handleSave} className="w-full px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600">
                        💾 Save
                    </button>
                </div>
            </div>
        </div>
    );
}
