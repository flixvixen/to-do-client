import React, { useEffect, useState } from "react";
import axios from "axios";
import AddModal from "../components/AddModal";
import { FaTrashAlt, FaEdit, FaTimes } from "react-icons/fa";

function Todo() {
  const [titles, setTitles] = useState([]);
  const [lists, setLists] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [expandedTitle, setExpandedTitle] = useState(null);
  const [listModalVisible, setListModalVisible] = useState(false);
  const [selectedTitle, setSelectedTitle] = useState("");
  const [editingTitle, setEditingTitle] = useState(null);
  const [editingList, setEditingList] = useState(null);
  const [newTitle, setNewTitle] = useState("");
  const [newListDesc, setNewListDesc] = useState("");
  const [doneTasks, setDoneTasks] = useState([]);
  const [taskStatus, setTaskStatus] = useState({});
  const [completedTitles, setCompletedTitles] = useState([]);

  // Function to handle the Edit button on Titles
  const handleTitleEdit = (titleId, title) => {
    setEditingTitle(titleId);
    setNewTitle(title);
  };

  // Function to handle the Edit button on Tasks
  const handleListEdit = (listId, listDesc) => {
    setEditingList(listId);
    setNewListDesc(listDesc);
  };

  // Function to cancel the editing mode for Title
  const cancelTitleEdit = () => {
    setEditingTitle(null); // Exit the edit mode
    setNewTitle(""); // Reset new title input
  };

  // Function to cancel the editing mode for List
  const cancelListEdit = () => {
    setEditingList(null); // Exit the edit mode
    setNewListDesc(""); // Reset new list description input
  };

  const onTaskAdded = async (newTitleId) => {
    await getTitles();
    if (newTitleId) {
      setExpandedTitle(newTitleId);
      getLists(newTitleId);
    }
  };

  const getTitles = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_ENDPOINT_URL}/get-titles`);
      setTitles(response.data.titles);
    } catch (error) {
      console.error("Error fetching titles:", error);
    }
  };

  const getLists = async (titleId) => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_ENDPOINT_URL}/get-lists/${titleId}`);
      setLists(response.data.lists);
      const title = titles.find(t => t.id === titleId)?.title || "Task Details";
      setSelectedTitle(title);
      setListModalVisible(true);
    } catch (error) {
      console.error("❌ Error fetching lists:", error.response ? error.response.data : error.message);
    }
  };

  // Function to handle checkbox changes and task completion
  const handleCheckboxChange = (taskId, isChecked, titleId) => {
    setTaskStatus((prevStatus) => {
      const updatedStatus = { ...prevStatus, [taskId]: isChecked };

      // Check if all tasks under this title are checked
      const allChecked = lists.every((task) => updatedStatus[task.id]);

      // If all tasks are checked and not already in the "Done" list, move the title to "Done"
      if (allChecked && !completedTitles.includes(titleId)) {
        setCompletedTitles((prevCompletedTitles) => [...prevCompletedTitles, titleId]);

        // Optionally move tasks to the doneTasks state
        const completedTasks = lists.filter(task => updatedStatus[task.id]);
        setDoneTasks((prevDoneTasks) => [...prevDoneTasks, ...completedTasks]);

        // Remove tasks from the ongoing list
        setLists(lists.filter(task => !updatedStatus[task.id]));
      }

      return updatedStatus;
    });
  };

  // Function to mark all tasks as done for a specific title
  const markAllTasksAsDone = async (titleId) => {
    const updatedTaskStatus = {};

    lists.forEach(task => {
      updatedTaskStatus[task.id] = true;
    });

    setTaskStatus(updatedTaskStatus);

    const tasksToMarkAsDone = lists.filter(task => updatedTaskStatus[task.id]);

    // Mark each task as done in the backend
    for (const task of tasksToMarkAsDone) {
      await axios.put(`${process.env.REACT_APP_ENDPOINT_URL}/mark-as-done/${task.id}`);
      setDoneTasks((prevDoneTasks) => [...prevDoneTasks, task]);
    }

    // Remove tasks from ongoing list
    setLists(lists.filter(task => !updatedTaskStatus[task.id]));
    setCompletedTitles((prevCompletedTitles) => [...prevCompletedTitles, titleId]);
  };

  // Function to handle task being unchecked and moved back to ongoing
  const handleTaskStatusChange = async (taskId, titleId, isChecked) => {
    if (!isChecked) {
      // Move the task back to ongoing tasks
      const taskToMoveBack = doneTasks.find((task) => task.id === taskId);
      setDoneTasks(doneTasks.filter((task) => task.id !== taskId));

      // Add the task back to ongoing lists
      setLists((prevLists) => [...prevLists, taskToMoveBack]);

      // Mark it as not done in the backend
      await axios.put(`${process.env.REACT_APP_ENDPOINT_URL}/mark-as-undone/${taskId}`);
      
      // Remove the title from the completedTitles array if there are still tasks left
      const updatedCompletedTitles = completedTitles.filter((completedTitleId) => completedTitleId !== titleId);
      setCompletedTitles(updatedCompletedTitles);
    }
  };

  const updateTitle = async (titleId) => {
    try {
      await axios.put(`${process.env.REACT_APP_ENDPOINT_URL}/update-title/${titleId}`, { title: newTitle });
      setTitles(titles.map(t => (t.id === titleId ? { ...t, title: newTitle } : t)));
      setEditingTitle(null);
    } catch (error) {
      console.error("Error updating title:", error);
    }
  };

  const updateList = async (listId) => {
    try {
      await axios.put(`${process.env.REACT_APP_ENDPOINT_URL}/update-list/${listId}`, { list_desc: newListDesc });
      setLists(lists.map(l => (l.id === listId ? { ...l, list_desc: newListDesc } : l)));
      setEditingList(null);
    } catch (error) {
      console.error("Error updating list:", error);
    }
  };

  const deleteTask = async (taskId) => {
    try {
      await axios.delete(`${process.env.REACT_APP_ENDPOINT_URL}/delete-task/${taskId}`);
      setLists(lists.filter((task) => task.id !== taskId));
      setDoneTasks(doneTasks.filter((task) => task.id !== taskId));
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const deleteTitle = async (titleId) => {
    try {
      await axios.delete(`${process.env.REACT_APP_ENDPOINT_URL}/delete-title/${titleId}`);
      setTitles(titles.filter((title) => title.id !== titleId));
      setCompletedTitles(completedTitles.filter((completedTitleId) => completedTitleId !== titleId));
    } catch (error) {
      console.error("Error deleting title:", error);
    }
  };

  useEffect(() => {
    getTitles();
  }, []);

  return (
    <div className="w-full min-h-screen flex justify-center items-center bg-black p-4">
      <div className="w-full max-w-lg bg-gray-900 p-6 rounded-2xl shadow-xl border-4 border-blue-500">
        <h2 className="text-xl font-bold text-center text-blue-400 mb-4">🚀 To Do List 🚀</h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="text-center font-semibold mb-2 text-blue-300">Ongoing</h3>
            {titles.filter((title) => !completedTitles.includes(title.id))
              .map((title) => (
                <div key={title.id} className="mb-2 flex justify-between items-center">
                  {editingTitle === title.id ? (
                    <input
                      type="text"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      onBlur={() => updateTitle(title.id)}
                      className="p-2 rounded-lg text-black"
                    />
                  ) : (
                    <button
                      className="w-full p-2 rounded-lg transition-all text-sm font-semibold text-white bg-blue-500 hover:bg-blue-600"
                      onClick={() => getLists(title.id)}
                    >
                      {title.title}
                    </button>
                  )}
                  <button onClick={() => handleTitleEdit(title.id, title.title)} className="ml-2 text-yellow-500">
                    <FaEdit className="w-5 h-5" />
                  </button>
                  {editingTitle === title.id && (
                    <button onClick={cancelTitleEdit} className="ml-2 text-red-500">
                      <FaTimes className="w-5 h-5" />
                    </button>
                  )}
                  <button onClick={() => deleteTitle(title.id)} className="ml-2 text-red-500">
                    <FaTrashAlt className="w-5 h-5" />
                  </button>
                </div>
              ))}
          </div>

          <div>
            <h3 className="text-center font-semibold mb-2 text-green-300">Done</h3>
            {doneTasks.map((task) => (
              <div key={task.id} className="mb-2 flex justify-between items-center">
                <input
                  type="checkbox"
                  checked={taskStatus[task.id] || false}
                  onChange={(e) => handleTaskStatusChange(task.id, task.titleId, e.target.checked)}
                  className="mr-2"
                />
                <span className="text-white">{task.list_desc}</span>
                <button onClick={() => deleteTask(task.id)} className="text-red-500">
                  <FaTrashAlt className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-center mt-4">
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white w-12 h-12 rounded-full shadow-lg text-xl flex items-center justify-center hover:bg-blue-700"
          >
            +
          </button>
        </div>
      </div>

      {showModal && <AddModal hide={() => setShowModal(false)} onTaskAdded={onTaskAdded} />}

      {listModalVisible && (
        <div className="fixed inset-0 flex justify-center items-center backdrop-blur-sm bg-opacity-50">
          <div className="bg-gray-900 p-6 rounded-lg shadow-lg border-2 border-blue-500 max-w-md w-full">
            <h3 className="text-center text-blue-300 font-semibold mb-4">{selectedTitle}</h3>
            <div className="space-y-2">
              {lists.length > 0 ? (
                lists.map((list) => (
                  <div key={list.id} className="flex items-center gap-2 p-2 bg-gray-800 rounded-lg text-white">
                    <input
                      type="checkbox"
                      checked={taskStatus[list.id] || false}
                      onChange={(e) => handleCheckboxChange(list.id, e.target.checked, list.titleId)}
                      className="mr-2"
                    />
                    {list.list_desc}
                    <button onClick={() => handleListEdit(list.id, list.list_desc)} className="text-yellow-500">
                      <FaEdit className="w-5 h-5" />
                    </button>
                    {editingList === list.id && (
                      <button onClick={cancelListEdit} className="ml-2 text-red-500">
                        <FaTimes className="w-5 h-5" />
                      </button>
                    )}
                    <button onClick={() => deleteTask(list.id)} className="text-red-500">
                      <FaTrashAlt className="w-5 h-5" />
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-center text-white">No tasks found.</p>
              )}
            </div>
            <button
              onClick={() => markAllTasksAsDone(selectedTitle)}
              className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white p-2 rounded-lg"
            >
              OK (Mark All as Done)
            </button>

            <button
              onClick={() => setListModalVisible(false)}
              className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Todo;
