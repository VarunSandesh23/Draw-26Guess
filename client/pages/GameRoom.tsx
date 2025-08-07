import React from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { ArrowLeft, Palette, MessageCircle, Timer } from 'lucide-react';

export default function GameRoom() {
  const { roomCode } = useParams();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-game-purple/20 p-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Button 
            variant="outline" 
            onClick={() => navigate('/dashboard')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="text-center">
            <CardHeader>
              <div className="w-16 h-16 bg-gradient-to-br from-game-purple to-game-purple-dark rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Palette className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-3xl">Game Room</CardTitle>
              <CardDescription className="text-lg">
                Room Code: <span className="font-mono text-xl font-bold">{roomCode}</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="p-4 bg-game-purple/10 rounded-lg border border-game-purple/20">
                  <Palette className="w-8 h-8 text-game-purple mx-auto mb-2" />
                  <h4 className="font-semibold">Drawing Canvas</h4>
                  <p className="text-sm text-muted-foreground">Real-time collaborative drawing</p>
                </div>
                <div className="p-4 bg-game-teal/10 rounded-lg border border-game-teal/20">
                  <MessageCircle className="w-8 h-8 text-game-teal mx-auto mb-2" />
                  <h4 className="font-semibold">Live Chat</h4>
                  <p className="text-sm text-muted-foreground">Guess and chat with friends</p>
                </div>
                <div className="p-4 bg-game-orange/10 rounded-lg border border-game-orange/20">
                  <Timer className="w-8 h-8 text-game-orange mx-auto mb-2" />
                  <h4 className="font-semibold">Timer</h4>
                  <p className="text-sm text-muted-foreground">Countdown for each round</p>
                </div>
              </div>
              
              <div className="p-8 bg-muted/50 rounded-lg">
                <Palette className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Coming Soon!</h3>
                <p className="text-muted-foreground">
                  The game room is being built. This will include:
                </p>
                <ul className="text-sm text-muted-foreground mt-4 space-y-1">
                  <li>• Real-time drawing canvas</li>
                  <li>• Live chat system</li>
                  <li>• Word guessing mechanics</li>
                  <li>• Score tracking</li>
                  <li>• Timer and round management</li>
                </ul>
              </div>
              <p className="text-sm text-muted-foreground">
                Continue prompting to have this page implemented with full functionality!
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
