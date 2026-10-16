import React, { useState } from "react";

import { motion } from "motion/react";

import axios from "axios";

import {
  FaUserTie,
  FaBriefcase,
  FaFileUpload,
  FaMicrophoneAlt,
  FaChartLine,
} from "react-icons/fa";

import { ServerUrl } from "../App";
import { useDispatch, useSelector } from "react-redux";
import { setUserData } from "../redux/userSlice";

function Step1SetUp({ onStart }) {
  const {userData}= useSelector((state)=>state.user)
  const dispatch = useDispatch()
  const [role, setRole] = useState("");
  const [experience, setExperience] = useState("");
  const [mode, setMode] = useState("Technical");
  const [resumeFile, setResumeFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const [projects, setProjects] = useState([]);
  const [skills, setSkills] = useState([]);
  const [resumeText, setResumeText] = useState("");

  const [analysisDone, setAnalysisDone] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  const handleUploadResume = async () => {
    if (!resumeFile || analyzing) return;

    setAnalyzing(true);

    const formdata = new FormData();
    formdata.append("resume", resumeFile);

    try {
      const result = await axios.post(
        ServerUrl + "/api/interview/resume",
        formdata,
        {
          withCredentials: true,
        }
      );

      console.log("Resume Analysis Result:", result.data);

      setRole(result.data.role || "");
      setExperience(result.data.experience || "");
      setProjects(result.data.projects || []);
      setSkills(result.data.skills || []);
      setResumeText(result.data.resumeText || "");

      setAnalysisDone(true);
    } catch (error) {
      console.log("Resume Error:", error.response?.data);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleStart = async() => {
    setLoading(true)
    try {
      const result = await axios.post(ServerUrl + "/api/interview/generate-questions" , {role, experience, mode , resumeText, projects, skills } , {withCredentials:true})
      console.log(result.data)
      if(userData){
        dispatch(setUserData({... userData , credits:result.data.creditsLeft}))
      }
      setLoading(false)
      onStart(result.data)

    } catch (error) {
         console.log("Generate Questions Error:", error.response?.data);
         setLoading(false)
    }
  }
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col md:flex-row">

        {/* LEFT SIDE */}
        <div className="md:w-2/5 bg-green-50 p-8 md:p-10 flex flex-col justify-center">

          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Start Your AI Interview
          </h1>

          <p className="text-sm text-gray-600 leading-relaxed mb-8">
            Practice real interview scenarios powered by AI.
            Improve communication, technical skills, and confidence.
          </p>

          {/* Feature 1 */}
          <div className="bg-white rounded-lg px-4 py-3 mb-3 flex items-center gap-3 shadow-sm">
            <FaUserTie className="text-green-600" />

            <span className="text-sm font-medium text-gray-700">
              Choose Role & Experience
            </span>
          </div>

          {/* Feature 2 */}
          <div className="bg-white rounded-lg px-4 py-3 mb-3 flex items-center gap-3 shadow-sm">
            <FaMicrophoneAlt className="text-green-600" />

            <span className="text-sm font-medium text-gray-700">
              Smart Voice Interview
            </span>
          </div>

          {/* Feature 3 */}
          <div className="bg-white rounded-lg px-4 py-3 flex items-center gap-3 shadow-sm">
            <FaChartLine className="text-green-600" />

            <span className="text-sm font-medium text-gray-700">
              Performance Analytics
            </span>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="md:w-3/5 p-8 md:p-10">

          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Interview SetUp
          </h2>

          {/* Role */}
          <div className="mb-4">
            <div className="relative">
              <FaUserTie className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="Enter role"
                className="w-full border-b border-gray-200 pl-10 pr-3 py-3 text-sm outline-none focus:border-green-500"
              />
            </div>
          </div>

          {/* Experience */}
          <div className="mb-4">
            <div className="relative">
              <FaBriefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

              <input
                type="text"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                placeholder="Experience (e.g. 2 years)"
                className="w-full border-b border-gray-200 pl-10 pr-3 py-3 text-sm outline-none focus:border-green-500"
              />
            </div>
          </div>

          {/* Interview Mode */}
          <div className="mb-5">
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              className="w-full border-b border-gray-200 px-1 py-3 text-sm text-gray-700 outline-none focus:border-green-500"
            >
              <option value="Technical">
                Technical Interview
              </option>

              <option value="HR">
                HR Interview
              </option>
            </select>
          </div>

          {/* Resume */}
          <div className="mb-5">

            {!analysisDone && (
              <motion.div
                whileHover={{ scale: 1.01 }}
                onClick={() =>
                  document.getElementById("resumeUpload").click()
                }
                className="border-2 border-dashed border-green-200 bg-green-50 rounded-xl p-7 text-center cursor-pointer hover:border-green-400 transition"
              >
                <FaFileUpload className="text-3xl mx-auto text-green-600 mb-3" />

                <input
                  type="file"
                  accept="application/pdf"
                  id="resumeUpload"
                  className="hidden"
                  onChange={(e) => {
                    setResumeFile(e.target.files[0]);
                  }}
                />

                <p className="text-sm text-gray-600 font-medium">
                  {resumeFile
                    ? resumeFile.name
                    : "Upload Resume.pdf"}
                </p>

                {resumeFile && (
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUploadResume();
                    }}
                    disabled={analyzing}
                    className="mt-4 bg-gray-800 text-white text-sm px-5 py-2 rounded-lg hover:bg-gray-900 transition disabled:opacity-50"
                  >
                    {analyzing
                      ? "Analyzing Resume..."
                      : "Analyze Resume"}
                  </motion.button>
                )}
              </motion.div>
            )}

            {analysisDone && (
              <motion.div
                    initial={{ opacity: 0, y:20 }}
                    animate={{ opacity:1, y:0}}
                    className="bg-gray-50 border border-gray-200 rounded-xl p-5 space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800">
                      Resume Analysis Result</h3>  
                    
                    {projects.length > 0 &&(
                      <div>
                      <p className="font-medium text-gray-700 mb-1">
                        Projects:</p>

                      <ul className="list-disc list-inside text-gray-600 space-y-1">
                        {projects.map((p,i)=>(
                          <li key={i}>{p}</li>
                        ))}
                      </ul>
                      </div>
                    )}


                    {skills.length > 0 &&(
                      <div>
                      <p className="font-medium text-gray-700 mb-1">
                        Skills:</p>

                      <ul className="flex flex-wrap gap-2">
                        {skills.map((s,i)=>(
                          <span key={i} className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">{s}</span>
                        ))}
                      </ul>
                      </div>
                    )}
              </motion.div>
            )}
            

            {/* Analysis Success */}
            {analysisDone && (
              <div className="border border-green-200 bg-green-50 rounded-xl p-4">
                <p className="text-green-700 text-sm font-medium">
                  Resume analyzed successfully!
                </p>

                <p className="text-xs text-gray-600 mt-1">
                  Resume information will be used for
                  personalized interview questions.
                </p>
              </div>
            )}
          </div>

          {/* Start Interview */}
          <motion.button
          onClick={handleStart}
  type="button"
  whileHover={{ scale: 1.01 }}
  whileTap={{ scale: 0.98 }}
  disabled={loading ||!role || !experience}
  className={`w-full text-white py-3 rounded-xl text-sm font-medium transition disabled:opacity-50 ${
    analysisDone
      ? "bg-green-600 hover:bg-green-700"
      : "bg-gray-600 hover:bg-gray-700"
  }`}
>
  {loading ? "Starting..." : "Start Interview"}
</motion.button>

        </div>
      </div>
    </div>
  );
}

export default Step1SetUp;