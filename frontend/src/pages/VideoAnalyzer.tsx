/**
 * VideoAnalyzer.tsx - 비디오 기반 행동 분석
 * Phase 5 Stream P2.2
 */

import { useState } from 'react';
import { Upload, Play, BarChart3, Download } from 'lucide-react';
import { useVideoAnalysis } from '../context/VideoAnalysisContext';

export function VideoAnalyzer() {
  const { videoSessions, analysisResults, uploadVideo, startAnalysis, generateABCFromAnalysis } = useVideoAnalysis();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [childId, setChildId] = useState(1);
  const [ltoId, setLtoId] = useState('lto_1');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      const videoId = await uploadVideo(selectedFile, childId, ltoId);
      setSelectedFile(null);
    } catch (error) {
      console.error('Failed to upload video:', error);
    }
  };

  const handleAnalyze = async (videoId: string) => {
    setIsAnalyzing(true);
    try {
      await startAnalysis(videoId);
    } catch (error) {
      console.error('Failed to analyze video:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-pastel-purple">🎥 비디오 기반 행동 분석</h1>
        <p className="text-gray-600 mt-2">세션 영상을 업로드하고 AI가 자동으로 행동을 분석합니다</p>
      </div>

      {/* 업로드 섹션 */}
      <div className="glass rounded-xl p-6">
        <h2 className="text-xl font-bold mb-4">비디오 업로드</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">아동 선택</label>
              <select
                value={childId}
                onChange={(e) => setChildId(Number(e.target.value))}
                className="w-full border border-gray-300 rounded-lg p-2"
              >
                <option value={1}>민준</option>
                <option value={2}>소영</option>
                <option value={3}>지호</option>
                <option value={4}>연서</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">목표 선택</label>
              <select
                value={ltoId}
                onChange={(e) => setLtoId(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2"
              >
                <option value="lto_1">요청하기</option>
                <option value="lto_2">자기관리</option>
                <option value="lto_3">사회적 상호작용</option>
              </select>
            </div>
          </div>

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <input
              type="file"
              accept="video/*"
              onChange={handleFileChange}
              className="hidden"
              id="video-upload"
            />
            <label htmlFor="video-upload" className="cursor-pointer">
              <Upload className="mx-auto mb-2 text-pastel-purple" size={32} />
              <p className="font-medium mb-1">비디오를 여기에 드래그하거나 클릭하여 선택</p>
              <p className="text-sm text-gray-600">{selectedFile?.name || 'MP4, WebM, Ogg 지원'}</p>
            </label>
          </div>

          <button
            onClick={handleUpload}
            disabled={!selectedFile}
            className="w-full bg-pastel-purple text-white py-2 rounded-lg hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            업로드
          </button>
        </div>
      </div>

      {/* 업로드된 비디오 목록 */}
      <div className="glass rounded-xl p-6">
        <h2 className="text-xl font-bold mb-4">분석 가능한 비디오</h2>
        <div className="space-y-3">
          {videoSessions.length === 0 ? (
            <p className="text-gray-500 text-center py-6">업로드된 비디오가 없습니다.</p>
          ) : (
            videoSessions.map((session) => {
              const analysis = analysisResults.find((a) => a.id === session.id);
              return (
                <div key={session.id} className="bg-white rounded-lg p-4 flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-bold">{session.videoUrl.split('/').pop()}</p>
                    <p className="text-sm text-gray-600">
                      업로드: {new Date(session.uploadedAt).toLocaleString('ko-KR')}
                    </p>
                    {analysis && (
                      <div className="mt-2 space-y-1 text-sm">
                        <p className="text-green-600">정확도: {analysis.analysis.overallAccuracy}%</p>
                        <p className="text-blue-600">독립성: {analysis.analysis.independenceRating}</p>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {!analysis && (
                      <button
                        onClick={() => handleAnalyze(session.id)}
                        disabled={isAnalyzing}
                        className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 transition"
                      >
                        <Play size={16} />
                        분석
                      </button>
                    )}
                    {analysis && (
                      <button
                        onClick={() => generateABCFromAnalysis(analysis.id)}
                        className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition"
                      >
                        <Download size={16} />
                        ABC 생성
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 분석 결과 */}
      {analysisResults.length > 0 && (
        <div className="glass rounded-xl p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <BarChart3 size={24} />
            분석 결과
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {analysisResults.map((result) => (
              <div key={result.id} className="bg-white rounded-lg p-4 border-l-4 border-blue-500">
                <h3 className="font-bold mb-3">행동 분석 요약</h3>
                <div className="space-y-2 text-sm">
                  {result.analysis.behaviorSummary.map((behavior, idx) => (
                    <div key={idx}>
                      <p className="font-medium">{behavior.behavior}</p>
                      <p className="text-gray-600">
                        발생: {behavior.occurrences}회, 총 {behavior.totalDuration}초, 신뢰도: {(behavior.averageConfidence * 100).toFixed(0)}%
                      </p>
                    </div>
                  ))}
                </div>
                {result.analysis.autoGeneratedABC && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="font-bold text-sm mb-2">자동 생성된 ABC</p>
                    <p className="text-xs text-gray-600">
                      선행: {result.analysis.autoGeneratedABC.antecedent}
                    </p>
                    <p className="text-xs text-gray-600">
                      행동: {result.analysis.autoGeneratedABC.behavior}
                    </p>
                    <p className="text-xs text-gray-600">
                      결과: {result.analysis.autoGeneratedABC.consequence}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default VideoAnalyzer;
