import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { getRoom, updateRoom, GameRoom, Player } from "../lib/firebase";
import CanvasDraw from "react-canvas-draw";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { ScrollArea } from "../components/ui/scroll-area";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import {
  ArrowLeft,
  Palette,
  MessageCircle,
  Timer,
  Trophy,
  Send,
  RotateCcw,
  Eye,
  EyeOff,
  Crown,
  CheckCircle,
} from "lucide-react";
import { toast } from "sonner";

interface ChatMessage {
  id: string;
  playerId: string;
  playerName: string;
  message: string;
  timestamp: Date;
  isCorrectGuess?: boolean;
}

interface GameState {
  currentDrawer?: string;
  currentWord?: string;
  timeLeft: number;
  messages: ChatMessage[];
  round: number;
  guessedPlayers: string[];
}

// Word bank for the game
const WORD_BANK = [
  "cat",
  "dog",
  "house",
  "tree",
  "car",
  "sun",
  "moon",
  "star",
  "fish",
  "bird",
  "flower",
  "pizza",
  "cake",
  "apple",
  "banana",
  "chair",
  "table",
  "phone",
  "book",
  "hat",
  "shoes",
  "guitar",
  "piano",
  "rainbow",
  "cloud",
  "mountain",
  "ocean",
  "butterfly",
  "elephant",
  "lion",
];

export default function GameRoom() {
  const { roomCode } = useParams<{ roomCode: string }>();
  const navigate = useNavigate();
  const { user, userProfile } = useAuth();
  const [room, setRoom] = useState<GameRoom | null>(null);
  const [gameState, setGameState] = useState<GameState>({
    timeLeft: 90,
    messages: [],
    round: 1,
    guessedPlayers: [],
  });
  const [currentGuess, setCurrentGuess] = useState("");
  const [canvasData, setCanvasData] = useState("");
  const [brushColor, setBrushColor] = useState("#000000");
  const [brushSize, setBrushSize] = useState(3);
  const [isDrawing, setIsDrawing] = useState(false);
  const [showWord, setShowWord] = useState(false);

  const canvasRef = useRef<CanvasDraw | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load room and initialize game
  useEffect(() => {
    const loadRoom = async () => {
      if (!roomCode || !user) return;

      try {
        const roomData = await getRoom(roomCode);
        if (!roomData) {
          toast.error("Room not found");
          navigate("/dashboard");
          return;
        }

        if (!roomData.started) {
          navigate(`/lobby/${roomCode}`);
          return;
        }

        setRoom(roomData);

        // Initialize game if needed
        if (!gameState.currentDrawer) {
          initializeGame(roomData);
        }
      } catch (error) {
        console.error("Error loading room:", error);
        toast.error("Failed to load game room");
      }
    };

    loadRoom();
  }, [roomCode, user, navigate]);

  // Initialize game with first drawer and word
  const initializeGame = (roomData: GameRoom) => {
    const firstDrawer = roomData.players[0];
    const randomWord = WORD_BANK[Math.floor(Math.random() * WORD_BANK.length)];

    setGameState((prev) => ({
      ...prev,
      currentDrawer: firstDrawer.uid,
      currentWord: randomWord,
      timeLeft: 90,
      round: 1,
      guessedPlayers: [],
    }));

    setIsDrawing(firstDrawer.uid === user?.uid);

    if (firstDrawer.uid === user?.uid) {
      toast.success(`You're drawing: ${randomWord}`, { duration: 3000 });
    } else {
      toast.info(`${firstDrawer.name} is drawing!`);
    }
  };

  // Timer countdown
  useEffect(() => {
    if (gameState.timeLeft <= 0) return;

    const timer = setTimeout(() => {
      setGameState((prev) => ({
        ...prev,
        timeLeft: prev.timeLeft - 1,
      }));
    }, 1000);

    return () => clearTimeout(timer);
  }, [gameState.timeLeft]);

  // End round when time runs out
  useEffect(() => {
    if (gameState.timeLeft === 0) {
      endRound();
    }
  }, [gameState.timeLeft]);

  // Auto-scroll chat messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [gameState.messages]);

  const sendMessage = () => {
    if (!currentGuess.trim() || !user || !room) return;

    const message: ChatMessage = {
      id: Date.now().toString(),
      playerId: user.uid,
      playerName: userProfile?.displayName || "Anonymous",
      message: currentGuess,
      timestamp: new Date(),
    };

    // Check if guess is correct
    if (
      !isDrawing &&
      gameState.currentWord &&
      currentGuess.toLowerCase().trim() === gameState.currentWord.toLowerCase()
    ) {
      message.isCorrectGuess = true;

      // Add points to player
      const updatedPlayers = room.players.map((p) =>
        p.uid === user.uid
          ? { ...p, score: p.score + Math.max(10, gameState.timeLeft) }
          : p,
      );

      // Update room with new scores
      updateRoom(roomCode!, { players: updatedPlayers });

      // Add to guessed players
      setGameState((prev) => ({
        ...prev,
        guessedPlayers: [...prev.guessedPlayers, user.uid],
        messages: [...prev.messages, message],
      }));

      toast.success(
        "Correct guess! +" + Math.max(10, gameState.timeLeft) + " points",
      );

      // Check if all players have guessed
      if (gameState.guessedPlayers.length + 1 >= room.players.length - 1) {
        setTimeout(endRound, 1000);
      }
    } else if (!isDrawing) {
      setGameState((prev) => ({
        ...prev,
        messages: [...prev.messages, message],
      }));
    }

    setCurrentGuess("");
  };

  const endRound = () => {
    if (!room) return;

    // Show the word
    toast.info(`The word was: ${gameState.currentWord}`);

    // Move to next drawer or end game
    const currentDrawerIndex = room.players.findIndex(
      (p) => p.uid === gameState.currentDrawer,
    );
    const nextDrawerIndex = (currentDrawerIndex + 1) % room.players.length;
    const isLastRound = gameState.round >= (room.maxRounds || 3);

    if (isLastRound && nextDrawerIndex === 0) {
      // Game finished
      setTimeout(() => {
        navigate(`/scoreboard/${roomCode}`);
      }, 2000);
      return;
    }

    // Start next round
    setTimeout(() => {
      const nextDrawer = room.players[nextDrawerIndex];
      const newWord = WORD_BANK[Math.floor(Math.random() * WORD_BANK.length)];
      const newRound =
        nextDrawerIndex === 0 ? gameState.round + 1 : gameState.round;

      setGameState((prev) => ({
        ...prev,
        currentDrawer: nextDrawer.uid,
        currentWord: newWord,
        timeLeft: 90,
        round: newRound,
        guessedPlayers: [],
        messages: [
          ...prev.messages,
          {
            id: Date.now().toString(),
            playerId: "system",
            playerName: "System",
            message: `Round ${newRound}: ${nextDrawer.name} is now drawing!`,
            timestamp: new Date(),
          },
        ],
      }));

      setIsDrawing(nextDrawer.uid === user?.uid);

      // Clear canvas
      if (canvasRef.current) {
        canvasRef.current.clear();
      }

      if (nextDrawer.uid === user?.uid) {
        toast.success(`Your turn! Draw: ${newWord}`, { duration: 3000 });
      } else {
        toast.info(`${nextDrawer.name} is drawing!`);
      }
    }, 3000);
  };

  const clearCanvas = () => {
    if (canvasRef.current && isDrawing) {
      canvasRef.current.clear();
    }
  };

  const currentDrawer = room?.players.find(
    (p) => p.uid === gameState.currentDrawer,
  );
  const hasGuessed = gameState.guessedPlayers.includes(user?.uid || "");

  if (!room) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-game-purple/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-game-purple mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading game...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-game-purple/20 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4"
        >
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => navigate("/dashboard")}
              className="mb-2"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Leave Game
            </Button>

            <div className="flex items-center gap-4">
              <Badge
                variant="secondary"
                className="bg-game-purple/20 text-game-purple"
              >
                Round {gameState.round}/{room.maxRounds || 3}
              </Badge>
              <Badge
                variant="secondary"
                className="bg-game-orange/20 text-game-orange"
              >
                <Timer className="w-3 h-3 mr-1" />
                {Math.floor(gameState.timeLeft / 60)}:
                {(gameState.timeLeft % 60).toString().padStart(2, "0")}
              </Badge>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Canvas Area */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-3"
          >
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Palette className="w-5 h-5 text-game-purple" />
                    <CardTitle>
                      {isDrawing
                        ? "Your Canvas"
                        : `${currentDrawer?.name}'s Canvas`}
                    </CardTitle>
                  </div>

                  {isDrawing && (
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setShowWord(!showWord)}
                      >
                        {showWord ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                        {showWord ? "Hide" : "Show"} Word
                      </Button>
                      <Button size="sm" variant="outline" onClick={clearCanvas}>
                        <RotateCcw className="w-4 h-4" />
                        Clear
                      </Button>
                    </div>
                  )}
                </div>

                {isDrawing && (
                  <CardDescription className="text-lg font-semibold">
                    {showWord ? (
                      <span className="text-game-purple">
                        Draw: {gameState.currentWord}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">
                        Click "Show Word" to see what to draw
                      </span>
                    )}
                  </CardDescription>
                )}

                {!isDrawing && hasGuessed && (
                  <CardDescription className="text-game-success font-semibold flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    You guessed correctly! Wait for others...
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <CanvasDraw
                    ref={canvasRef}
                    canvasWidth={800}
                    canvasHeight={500}
                    brushColor={brushColor}
                    brushRadius={brushSize}
                    disabled={!isDrawing}
                    hideGrid={true}
                    className="border rounded-lg bg-white shadow-inner"
                    style={{ width: "100%", height: "auto" }}
                  />

                  {!isDrawing && (
                    <div className="absolute inset-0 bg-transparent" />
                  )}
                </div>

                {isDrawing && (
                  <div className="flex items-center gap-4 mt-4">
                    <div className="flex items-center gap-2">
                      <label className="text-sm font-medium">Color:</label>
                      <input
                        type="color"
                        value={brushColor}
                        onChange={(e) => setBrushColor(e.target.value)}
                        className="w-8 h-8 rounded border cursor-pointer"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-sm font-medium">Size:</label>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={brushSize}
                        onChange={(e) => setBrushSize(Number(e.target.value))}
                        className="w-20"
                      />
                      <span className="text-sm w-6">{brushSize}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Chat and Players */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1 space-y-4"
          >
            {/* Players */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Trophy className="w-5 h-5" />
                  Players
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {room.players
                  .sort((a, b) => b.score - a.score)
                  .map((player, index) => (
                    <div
                      key={player.uid}
                      className={`flex items-center justify-between p-2 rounded-lg ${
                        player.uid === gameState.currentDrawer
                          ? "bg-game-purple/10 border border-game-purple/30"
                          : "bg-muted/50"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className="relative">
                          <Avatar className="w-8 h-8">
                            <AvatarImage
                              src={player.photoURL || undefined}
                              alt={player.name}
                            />
                            <AvatarFallback className="text-xs">
                              {player.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          {player.uid === gameState.currentDrawer && (
                            <Palette className="w-3 h-3 absolute -top-1 -right-1 text-game-purple bg-white rounded-full p-0.5" />
                          )}
                          {gameState.guessedPlayers.includes(player.uid) && (
                            <CheckCircle className="w-3 h-3 absolute -top-1 -right-1 text-game-success bg-white rounded-full" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium truncate max-w-20">
                            {player.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {player.score} pts
                          </p>
                        </div>
                      </div>
                      {index === 0 && (
                        <Crown className="w-4 h-4 text-game-orange" />
                      )}
                    </div>
                  ))}
              </CardContent>
            </Card>

            {/* Chat */}
            <Card className="flex-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <MessageCircle className="w-5 h-5" />
                  Chat
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <ScrollArea className="h-64 w-full">
                  <div className="space-y-2 pr-2">
                    <AnimatePresence>
                      {gameState.messages.map((msg) => (
                        <motion.div
                          key={msg.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`p-2 rounded-lg text-sm ${
                            msg.isCorrectGuess
                              ? "bg-game-success/20 border border-game-success/30"
                              : msg.playerId === "system"
                                ? "bg-game-purple/10 border border-game-purple/30"
                                : "bg-muted/50"
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-xs">
                              {msg.playerName}
                            </span>
                            {msg.isCorrectGuess && (
                              <CheckCircle className="w-3 h-3 text-game-success" />
                            )}
                          </div>
                          <p
                            className={
                              msg.isCorrectGuess
                                ? "font-semibold text-game-success"
                                : ""
                            }
                          >
                            {msg.message}
                          </p>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {!isDrawing && !hasGuessed && (
                  <div className="flex gap-2">
                    <Input
                      placeholder="Type your guess..."
                      value={currentGuess}
                      onChange={(e) => setCurrentGuess(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                      className="flex-1"
                    />
                    <Button size="sm" onClick={sendMessage}>
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                )}

                {isDrawing && (
                  <div className="text-center text-sm text-muted-foreground">
                    You're drawing! Others are guessing...
                  </div>
                )}

                {hasGuessed && (
                  <div className="text-center text-sm text-game-success font-medium">
                    ✓ You guessed correctly!
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
