import React from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { ArrowLeft, Trophy, Medal, Award } from 'lucide-react';

export default function Scoreboard() {
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
              <div className="w-16 h-16 bg-gradient-to-br from-game-orange to-game-orange-light rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-3xl">Final Scoreboard</CardTitle>
              <CardDescription className="text-lg">
                Game Results for Room: <span className="font-mono text-xl font-bold">{roomCode}</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="p-4 bg-game-orange/10 rounded-lg border border-game-orange/20">
                  <Trophy className="w-8 h-8 text-game-orange mx-auto mb-2" />
                  <h4 className="font-semibold">Winner Celebration</h4>
                  <p className="text-sm text-muted-foreground">Confetti and animations</p>
                </div>
                <div className="p-4 bg-game-purple/10 rounded-lg border border-game-purple/20">
                  <Medal className="w-8 h-8 text-game-purple mx-auto mb-2" />
                  <h4 className="font-semibold">Score Breakdown</h4>
                  <p className="text-sm text-muted-foreground">Detailed player rankings</p>
                </div>
                <div className="p-4 bg-game-teal/10 rounded-lg border border-game-teal/20">
                  <Award className="w-8 h-8 text-game-teal mx-auto mb-2" />
                  <h4 className="font-semibold">Game Stats</h4>
                  <p className="text-sm text-muted-foreground">Round by round analysis</p>
                </div>
              </div>
              
              <div className="p-8 bg-muted/50 rounded-lg">
                <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Coming Soon!</h3>
                <p className="text-muted-foreground">
                  The scoreboard is being built. This will include:
                </p>
                <ul className="text-sm text-muted-foreground mt-4 space-y-1">
                  <li>• Animated player rankings</li>
                  <li>• Winner celebration with confetti</li>
                  <li>• Score counting animations</li>
                  <li>• Game statistics</li>
                  <li>• Play again functionality</li>
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
