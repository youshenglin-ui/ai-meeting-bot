import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  MessageSquare, 
  Settings, 
  ListChecks, 
  FileText, 
  Play, 
  CheckCircle2, 
  Circle,
  Loader2,
  AlertCircle,
  Clock,
  User,
  Save,
  Mic,
  MicOff,
  Link,
  Wifi
} from 'lucide-react';

// API Configuration
const apiKey = "AIzaSyAlgosCPNYOhAhUg8dqYfKYNs3aIHUhQKE"; // 系統會在執行環境自動提供

// 預設的模擬逐字稿，方便使用者直接測試
const MOCK_TRANSCRIPT = `[10:00] 主席: 大家好，歡迎參加 2026 年度第一季產品發展線上研討會。今天主要討論我們新一代 AI 產品的佈局。請大家踴躍發言。
[10:05] 張經理: 關於新的 AI 產品線，我想問一下目前的開發進度大概到哪裡了？預計何時可以進入 Beta 測試？
[10:08] 主席: 好的，這個進度問題我們等下統整回覆。
[10:12] 李工程師: 我這邊有個技術問題。請問新系統會完全依賴雲端運算，還是會支援邊緣運算 (Edge Computing)？這攸關我們硬體採購的規格。
[10:15] 王行銷: 請問在定價策略上，我們是採用訂閱制還是買斷制？如果是訂閱制，有考慮針對教育機構提供優惠嗎？
[10:18] 趙法務: 提醒大家，目前各國的 AI 法規都在收緊。建議我們在收集使用者資料訓練模型時，必須加上明確的同意條款。這點非常重要。
[10:22] 主席: 趙法務的建議很好，這也算是一個我們必須解決的重要議題。大家還有其他問題嗎？
[10:25] 林客服: 請問上線後，第一線的客服人員大概需要提前多久接受系統培訓？`;

export default function App() {
  const [transcript, setTranscript] = useState(MOCK_TRANSCRIPT);
  const [keywords, setKeywords] = useState("請問, 想問, 問題, 建議");
  const [questions, setQuestions] = useState([]);
  const [qaDiscussion, setQaDiscussion] = useState("");
  const [conclusion, setConclusion] = useState("");
  
  const [isExtracting, setIsExtracting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  // 語音與會議模擬相關 State & Ref
  const [isRecording, setIsRecording] = useState(false);
  const [meetUrl, setMeetUrl] = useState("");
  const [botStatus, setBotStatus] = useState("已連線並準備就緒");
  const recognitionRef = useRef(null);

  // 初始化語音辨識 API
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'zh-TW'; // 設定為中文

      recognitionRef.current.onresult = (event) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript.trim()) {
          const now = new Date();
          const timeString = `[${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}]`;
          setTranscript(prev => {
            const newText = prev ? prev + '\n' : '';
            return newText + `${timeString} 語音輸入: ${finalTranscript.trim()}`;
          });
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error("語音辨識錯誤:", event.error);
        setIsRecording(false);
        setBotStatus("語音辨識發生錯誤或已停止");
        if (event.error === 'not-allowed') {
          setError("麥克風存取被拒絕。請確認您已允許瀏覽器的麥克風權限。如果您是在預覽視窗 (iframe) 中執行，可能因安全性限制無法使用麥克風，建議您改用手動貼上逐字稿。");
        } else {
          setError(`語音辨識發生錯誤: ${event.error}`);
        }
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
        setBotStatus("已連線並準備就緒");
      };
    } else {
      console.warn("此瀏覽器不支援語音辨識 API");
    }
  }, []);

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      setBotStatus("已連線並準備就緒");
    } else {
      try {
        recognitionRef.current?.start();
        setIsRecording(true);
        setBotStatus("麥克風收音中...");
        setError(null);
      } catch (e) {
        setError("無法啟動麥克風，請確認瀏覽器權限或使用 Chrome/Edge 瀏覽器。");
      }
    }
  };

  const handleJoinMeet = () => {
    if (!meetUrl.trim()) {
      setError("請輸入會議網址 (例如 https://meet.google.com/xxx-xxxx-xxx)");
      return;
    }
    setBotStatus("正在連接會議室...");
    setError(null);
    
    // 模擬 Bot 加入會議的延遲
    setTimeout(() => {
      setBotStatus("Bot 已加入會議，開始即時記錄");
      setMeetUrl(""); // 清空網址
      if (!isRecording) {
        try {
          recognitionRef.current?.start();
          setIsRecording(true);
        } catch(e) {
          console.error("啟動麥克風失敗:", e);
          setError("無法自動啟動麥克風，這可能是瀏覽器的安全性限制（需要使用者手動點擊）。請嘗試直接點擊下方的「開啟麥克風」。");
          setIsRecording(false);
          setBotStatus("已連線並準備就緒");
        }
      }
    }, 2000);
  };

  // 輔助函數：呼叫 Gemini API 進行重試
  const callGeminiAPI = async (prompt, systemInstruction = "", requireJson = false) => {
    const retries = 5;
    const delays = [1000, 2000, 4000, 8000, 16000];
    
    let payload = {
      contents: [{ parts: [{ text: prompt }] }],
      systemInstruction: { parts: [{ text: systemInstruction }] }
    };

    if (requireJson) {
      payload.generationConfig = {
        responseMimeType: "application/json",
        responseSchema: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            properties: {
              id: { type: "STRING", description: "唯一識別碼 (例如 q1, q2)" },
              time: { type: "STRING", description: "發言時間 (例如 [10:05])" },
              speaker: { type: "STRING", description: "發言對象 (例如 張經理)" },
              content: { type: "STRING", description: "發言或提問的完整內容" },
              category: { type: "STRING", description: "問題分類 (例如 技術, 商業, 行政)" }
            },
            required: ["id", "time", "speaker", "content", "category"]
          }
        }
      };
    }

    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const result = await response.json();
        
        if (result.error) throw new Error(result.error.message);
        return result.candidates[0].content.parts[0].text;
      } catch (err) {
        if (i === retries - 1) throw err;
        await new Promise(res => setTimeout(res, delays[i]));
      }
    }
  };

  // 步驟一：擷取問題
  const handleExtractQuestions = async () => {
    if (!transcript.trim()) {
      setError("請先輸入或載入會議逐字稿。");
      return;
    }
    
    setIsExtracting(true);
    setError(null);
    setConclusion(""); // 清空之前的結論
    
    try {
      const prompt = `請以 AI 會議助理的角色，閱讀以下會議逐字稿。
你的任務是擷取會議中的「提問」或「重要建議」。
請特別關注包含以下關鍵字的句子：[${keywords}]。
請準確擷取發言時間、發言對象與發言內容，並給予簡單的分類。

會議逐字稿：
${transcript}`;

      const systemInstruction = "你是一個精準的會議紀錄助理，請嚴格遵守 JSON 格式輸出，不要包含任何其他文字。";
      
      const responseText = await callGeminiAPI(prompt, systemInstruction, true);
      const parsedQuestions = JSON.parse(responseText);
      
      // 為每個問題加上 UI 狀態欄位
      const questionsWithState = parsedQuestions.map(q => ({
        ...q,
        included: true, // 預設全部納入 QA
        note: ""        // 主席註記為空
      }));
      
      setQuestions(questionsWithState);
    } catch (err) {
      console.error("擷取失敗:", err);
      setError("擷取問題時發生錯誤，請稍後再試或檢查網路連線。");
    } finally {
      setIsExtracting(false);
    }
  };

  // 步驟二：更新單一問題的狀態 (勾選/註記)
  const toggleInclude = (id) => {
    setQuestions(questions.map(q => 
      q.id === id ? { ...q, included: !q.included } : q
    ));
  };

  const updateNote = (id, noteText) => {
    setQuestions(questions.map(q => 
      q.id === id ? { ...q, note: noteText } : q
    ));
  };

  // 步驟三：生成最終會議紀錄
  const handleGenerateConclusion = async () => {
    const includedQuestions = questions.filter(q => q.included);
    
    if (includedQuestions.length === 0 && !qaDiscussion.trim()) {
      setError("請至少保留一個問題或輸入 QA 討論內容，以便生成結論。");
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const questionsContext = includedQuestions.map(q => 
        `- [${q.time}] ${q.speaker} 提問: ${q.content}\n  主席註記/回覆方向: ${q.note || "無特別註記"}`
      ).join('\n');

      const prompt = `請以專業的會議紀錄員身份，撰寫一份最終的「會議結論與紀錄」。
以下是會議的基礎資料：

1. 【原始會議討論重點摘要】（請基於以下逐字稿判斷會議主旨與大綱）：
${transcript}

2. 【QA 環節重點問題】（主席已篩選並確認要處理的問題）：
${questionsContext}

3. 【QA 環節主席/團隊的實際討論與解答內容】：
${qaDiscussion || "（未提供額外文字紀錄，請依據上述問題與註記整理代辦事項或待確認清單）"}

請依據上述資料，生成一份結構清晰的會議紀錄，包含以下區塊：
### 一、 會議主旨與摘要
### 二、 重要問答紀錄 (QA)
### 三、 決議事項與代辦清單 (Action Items)

請使用繁體中文，語氣專業、清晰。排版請使用 Markdown 格式。`;

      const responseText = await callGeminiAPI(prompt, "你是一個專業的行政助理，專精於會議紀錄彙整。");
      setConclusion(responseText);
    } catch (err) {
      console.error("生成結論失敗:", err);
      setError("生成會議紀錄時發生錯誤，請稍後再試。");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header */}
        <header className="flex items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-600 rounded-xl">
              <Bot className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">AI 會議紀錄助理</h1>
              <p className={`text-sm flex items-center mt-1 ${isRecording ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
                <span className={`w-2 h-2 rounded-full mr-2 ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`}></span>
                Bot 狀態：{botStatus}
              </p>
            </div>
          </div>
        </header>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md flex items-start">
            <AlertCircle className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* 左側：情境與逐字稿輸入 */}
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full">
            <div className="flex items-center mb-4">
              <MessageSquare className="w-5 h-5 text-blue-600 mr-2" />
              <h2 className="text-lg font-semibold">1. 會議來源與逐字稿</h2>
            </div>
            
            <div className="space-y-4 flex-grow">
              
              {/* 新增：語音與會議模擬控制面板 */}
              <div className="flex flex-col space-y-3 p-4 bg-blue-50/50 rounded-xl border border-blue-100">
                <label className="block text-sm font-medium text-blue-900">
                  <Wifi className="w-4 h-4 inline mr-1 mb-0.5"/> 邀請 Bot 加入線上會議
                </label>
                <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2">
                  <div className="relative flex-grow w-full">
                    <Link className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <input 
                      type="text" 
                      placeholder="貼上 Google Meet 或 Teams 網址..." 
                      value={meetUrl} 
                      onChange={e => setMeetUrl(e.target.value)} 
                      className="w-full text-sm pl-9 pr-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none" 
                    />
                  </div>
                  <button 
                    onClick={handleJoinMeet} 
                    className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors whitespace-nowrap"
                  >
                    邀請加入
                  </button>
                </div>
                
                <div className="flex items-center justify-between mt-2 pt-3 border-t border-blue-100/50">
                  <span className="text-sm text-gray-600">或直接開啟本機麥克風收音：</span>
                  <button 
                    onClick={toggleRecording} 
                    className={`flex items-center px-4 py-2 rounded-full text-sm font-medium transition-colors shadow-sm border ${isRecording ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`}
                  >
                    {isRecording ? <><MicOff className="w-4 h-4 mr-2 animate-pulse" /> 停止收音</> : <><Mic className="w-4 h-4 mr-2 text-blue-600" /> 開啟麥克風</>}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  設定觸發關鍵字 (逗號分隔)
                </label>
                <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg p-2 focus-within:ring-2 focus-within:ring-blue-500">
                  <Settings className="w-4 h-4 text-gray-400 mr-2" />
                  <input 
                    type="text" 
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                    className="bg-transparent border-none outline-none w-full text-sm"
                    placeholder="例如: 請問, 問題, 建議..."
                  />
                </div>
              </div>

              <div className="flex flex-col flex-grow">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  即時會議逐字稿 (可編輯模擬)
                </label>
                <textarea 
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  className="w-full h-48 md:h-full flex-grow p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none font-mono"
                  placeholder="將會議逐字稿貼上於此..."
                />
              </div>
            </div>

            <button 
              onClick={handleExtractQuestions}
              disabled={isExtracting}
              className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-lg transition duration-200 flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isExtracting ? (
                <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> 正在讀取與思考中...</>
              ) : (
                <><Play className="w-5 h-5 mr-2" /> 讀取逐字稿並擷取問題</>
              )}
            </button>
          </section>

          {/* 右側：主席審閱介面 */}
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <ListChecks className="w-5 h-5 text-indigo-600 mr-2" />
                <h2 className="text-lg font-semibold">2. 主席審閱與歸納清單</h2>
              </div>
              <span className="text-xs font-medium bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full">
                共擷取 {questions.length} 筆
              </span>
            </div>

            {questions.length === 0 ? (
              <div className="flex-grow flex flex-col items-center justify-center text-gray-400 bg-gray-50 rounded-lg border border-dashed border-gray-200 p-8">
                <Bot className="w-12 h-12 mb-3 opacity-20" />
                <p className="text-sm">等待讀取逐字稿...</p>
                <p className="text-xs mt-1">點擊左側按鈕讓 Bot 進行分析</p>
              </div>
            ) : (
              <div className="flex-grow overflow-y-auto pr-2 space-y-4 custom-scrollbar" style={{ maxHeight: '400px' }}>
                {questions.map((q, index) => (
                  <div 
                    key={q.id || index} 
                    className={`p-4 rounded-xl border transition-colors ${q.included ? 'bg-indigo-50/50 border-indigo-200' : 'bg-gray-50 border-gray-200 opacity-70'}`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <span className="flex items-center"><Clock className="w-3 h-3 mr-1"/> {q.time}</span>
                        <span className="flex items-center font-medium text-gray-800"><User className="w-3 h-3 mr-1"/> {q.speaker}</span>
                        <span className="text-xs bg-white px-2 py-0.5 rounded-full border border-gray-200 text-gray-500">{q.category}</span>
                      </div>
                      <button 
                        onClick={() => toggleInclude(q.id)}
                        className="flex items-center text-sm font-medium transition-colors"
                      >
                        {q.included ? (
                          <span className="text-indigo-600 flex items-center"><CheckCircle2 className="w-5 h-5 mr-1" /> 納入QA</span>
                        ) : (
                          <span className="text-gray-400 flex items-center"><Circle className="w-5 h-5 mr-1" /> 已排除</span>
                        )}
                      </button>
                    </div>
                    
                    <p className="text-gray-800 mb-3 font-medium">{q.content}</p>
                    
                    {q.included && (
                      <div className="mt-2">
                        <input
                          type="text"
                          value={q.note}
                          onChange={(e) => updateNote(q.id, e.target.value)}
                          placeholder="主席註記 (例：交由研發部回答、延後討論...)"
                          className="w-full text-sm bg-white border border-gray-200 rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* 底部：結論與報告生成 */}
        {questions.length > 0 && (
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 animate-fade-in">
            <div className="flex items-center mb-4">
              <FileText className="w-5 h-5 text-emerald-600 mr-2" />
              <h2 className="text-lg font-semibold">3. QA 討論紀錄與會議結論</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* QA 紀錄輸入 */}
              <div className="flex flex-col">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  會議 QA 環節實際討論內容紀錄 (提供給 AI 統整的素材)
                </label>
                <textarea 
                  value={qaDiscussion}
                  onChange={(e) => setQaDiscussion(e.target.value)}
                  className="w-full h-40 p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none resize-none"
                  placeholder="例如：\n關於進度問題，研發部回覆預計下個月初 Beta 測試。\n邊緣運算的部分，目前先以雲端為主，第二階段才會評估邊緣部署..."
                />
                <button 
                  onClick={handleGenerateConclusion}
                  disabled={isGenerating}
                  className="mt-4 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2.5 px-4 rounded-lg transition duration-200 flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isGenerating ? (
                    <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> 正在彙整會議紀錄...</>
                  ) : (
                    <><Save className="w-5 h-5 mr-2" /> 生成最終會議結論與紀錄</>
                  )}
                </button>
              </div>

              {/* 最終結果呈現 */}
              <div className="flex flex-col">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  AI 生成之會議紀錄 (Preview)
                </label>
                <div className="w-full h-64 lg:h-full min-h-[16rem] p-4 bg-gray-900 text-gray-100 rounded-lg overflow-y-auto font-mono text-sm leading-relaxed whitespace-pre-wrap relative shadow-inner">
                  {conclusion ? (
                     conclusion
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500">
                      <FileText className="w-10 h-10 mb-2 opacity-30" />
                      <p>等待生成會議紀錄...</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

      </div>
      
      {/* 簡單的 CSS 補充 */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out forwards;
        }
      `}} />
    </div>
  );
}