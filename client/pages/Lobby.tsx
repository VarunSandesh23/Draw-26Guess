import React from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { ArrowLeft, Users, Play } from 'lucide-react';

export default function Lobby() {
  const { roomCode } = useParams();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-game-purple/20 p-4">
      <div className="max-w-4xl mx-auto">
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
              <div className="w-16 h-16 bg-gradient-to-br from-game-teal to-game-teal-light rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-3xl">Game Lobby</CardTitle>
              <CardDescription className="text-lg">
                Room Code: <span className="font-mono text-xl font-bold">{roomCode}</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-8 bg-muted/50 rounded-lg">
                <Play className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Coming Soon!</h3>
                <p className="text-muted-foreground">
                  The lobby system is being built. This will include:
                </p>
                <ul className="text-sm text-muted-foreground mt-4 space-y-1">
                  <li>• Real-time player list</li>
                  <li>• Ready system</li>
                  <li>• Game settings</li>
                  <li>• Start game functionality</li>
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
