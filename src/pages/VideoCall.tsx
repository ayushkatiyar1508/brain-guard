import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Video, Phone, PhoneOff, Mic, MicOff, VideoOff, Users, Calendar, Clock } from 'lucide-react';

export default function VideoCall() {
  const [isCallActive, setIsCallActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  const contacts = [
    { id: '1', name: 'Dr. Sarah Johnson', role: 'Healthcare Professional', status: 'online' },
    { id: '2', name: 'Emily Chen', role: 'Family Caregiver', status: 'online' },
    { id: '3', name: 'Michael Brown', role: 'Professional Caregiver', status: 'offline' },
    { id: '4', name: 'Dr. Robert Lee', role: 'Healthcare Professional', status: 'busy' },
  ];

  const upcomingCalls = [
    { id: '1', title: 'Weekly Check-in', contact: 'Dr. Sarah Johnson', time: 'Today, 2:00 PM' },
    { id: '2', title: 'Family Call', contact: 'Emily Chen', time: 'Tomorrow, 10:00 AM' },
  ];

  const handleStartCall = () => {
    setIsCallActive(true);
  };

  const handleEndCall = () => {
    setIsCallActive(false);
    setIsMuted(false);
    setIsVideoOff(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-secondary';
      case 'busy':
        return 'bg-destructive';
      case 'offline':
        return 'bg-muted-foreground';
      default:
        return 'bg-muted-foreground';
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 xl:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
          <div>
            <h1 className="text-3xl xl:text-4xl font-bold text-foreground flex items-center gap-3">
              <Video className="w-10 h-10 text-primary" />
              Video Call
            </h1>
            <p className="text-senior text-muted-foreground mt-2">
              Connect with caregivers and healthcare professionals
            </p>
          </div>
          <Link to="/">
            <Button variant="outline" className="btn-senior">
              Back to Dashboard
            </Button>
          </Link>
        </div>

        {isCallActive ? (
          <Card className="border-primary">
            <CardContent className="p-0">
              <div className="relative bg-muted aspect-video rounded-t-lg flex items-center justify-center">
                <div className="text-center">
                  {isVideoOff ? (
                    <div className="space-y-4">
                      <VideoOff className="w-24 h-24 text-muted-foreground mx-auto" />
                      <p className="text-senior-xl text-muted-foreground">Camera is off</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Video className="w-24 h-24 text-primary mx-auto" />
                      <p className="text-senior-xl text-foreground">Video call in progress...</p>
                    </div>
                  )}
                </div>
                <div className="absolute top-4 right-4">
                  <Badge className="text-senior">Connected</Badge>
                </div>
              </div>
              
              <div className="p-8 space-y-6">
                <div className="text-center">
                  <h3 className="text-senior-xl font-semibold">Dr. Sarah Johnson</h3>
                  <p className="text-senior text-muted-foreground">Healthcare Professional</p>
                </div>

                <div className="flex justify-center gap-4">
                  <Button
                    variant={isMuted ? 'destructive' : 'default'}
                    size="lg"
                    className="btn-senior w-32"
                    onClick={() => setIsMuted(!isMuted)}
                  >
                    {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                  </Button>
                  
                  <Button
                    variant={isVideoOff ? 'destructive' : 'default'}
                    size="lg"
                    className="btn-senior w-32"
                    onClick={() => setIsVideoOff(!isVideoOff)}
                  >
                    {isVideoOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
                  </Button>
                  
                  <Button
                    variant="destructive"
                    size="lg"
                    className="btn-senior w-32"
                    onClick={handleEndCall}
                  >
                    <PhoneOff className="w-6 h-6" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="text-senior-xl flex items-center gap-2">
                  <Users className="w-6 h-6 text-primary" />
                  Contacts
                </CardTitle>
                <CardDescription className="text-senior">
                  Your caregivers and healthcare team
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                  {contacts.map((contact) => (
                    <div
                      key={contact.id}
                      className="p-6 rounded-lg border bg-card flex items-center justify-between"
                    >
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                            <Users className="w-8 h-8 text-muted-foreground" />
                          </div>
                          <div
                            className={`absolute bottom-0 right-0 w-5 h-5 rounded-full border-2 border-card ${getStatusColor(contact.status)}`}
                          />
                        </div>
                        <div>
                          <h3 className="text-senior-lg font-semibold">{contact.name}</h3>
                          <p className="text-senior text-muted-foreground">{contact.role}</p>
                          <Badge variant="outline" className="mt-1 capitalize">
                            {contact.status}
                          </Badge>
                        </div>
                      </div>
                      <Button
                        className="btn-senior"
                        disabled={contact.status === 'offline'}
                        onClick={handleStartCall}
                      >
                        <Phone className="w-5 h-5 mr-2" />
                        Call
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-senior-xl flex items-center gap-2">
                  <Calendar className="w-6 h-6 text-secondary" />
                  Upcoming Calls
                </CardTitle>
                <CardDescription className="text-senior">
                  Scheduled video consultations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingCalls.map((call) => (
                    <div
                      key={call.id}
                      className="p-6 rounded-lg border bg-card flex items-center justify-between"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                          <Video className="w-8 h-8 text-primary" />
                        </div>
                        <div>
                          <h3 className="text-senior-lg font-semibold">{call.title}</h3>
                          <p className="text-senior text-muted-foreground">{call.contact}</p>
                          <div className="flex items-center gap-2 mt-1 text-senior text-muted-foreground">
                            <Clock className="w-4 h-4" />
                            {call.time}
                          </div>
                        </div>
                      </div>
                      <Button className="btn-senior" onClick={handleStartCall}>
                        <Video className="w-5 h-5 mr-2" />
                        Join
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-muted">
              <CardHeader>
                <CardTitle className="text-senior-xl">About Video Calls</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-senior-lg font-semibold mb-2">Stay Connected</h3>
                  <p className="text-senior text-muted-foreground">
                    Video calls allow you to stay in touch with your caregivers and healthcare team from the comfort of your home.
                  </p>
                </div>
                <div>
                  <h3 className="text-senior-lg font-semibold mb-2">Easy to Use</h3>
                  <p className="text-senior text-muted-foreground">
                    Large, simple controls make it easy to manage your calls. Just tap to mute, turn off video, or end the call.
                  </p>
                </div>
                <div>
                  <h3 className="text-senior-lg font-semibold mb-2">Secure & Private</h3>
                  <p className="text-senior text-muted-foreground">
                    All video calls are encrypted to protect your privacy and health information.
                  </p>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
