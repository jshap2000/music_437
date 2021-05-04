from django.contrib.auth.models import User, Group
from .models import UserPiece, PlayablePiece
from rest_framework import viewsets
from rest_framework import permissions
from backend.midi.serializers import UserSerializer, GroupSerializer, UserPieceSerializer, PlayablePieceSerializer
from backend.midi.midi_analyzer.MidiParser import MidiParser
from backend.midi.midi_analyzer.MidiData import MidiData
from backend.midi.midi_analyzer.MidiEventDecoder import MidiEventDecoder
import os


class UserViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows users to be viewed or edited.
    """
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]


class GroupViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows groups to be viewed or edited.
    """
    queryset = Group.objects.all()
    serializer_class = GroupSerializer
    permission_classes = [permissions.IsAuthenticated]


class UserPieceViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows users to be viewed or edited.
    """
    queryset = UserPiece.objects.all()
    serializer_class = UserPieceSerializer
    permission_classes = [permissions.AllowAny]

class PlayablePieceViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows users to be viewed or edited.
    """
    queryset = PlayablePiece.objects.all()
    serializer_class = PlayablePieceSerializer
    permission_classes = [permissions.AllowAny]

    def perform_create(self, serializer):
        data = self.request.data
        # Save with the new value for the target model fields
        
        model_obj = serializer.save()
        arr = serializer.data['midi_file'].split('/')
       
        
        piece = model_obj
        
        if piece.time_per_note:
            notes = {}
            grading = {}
            file_name = os.getcwd() + "/media/playable_midis/" + arr[(len(arr)-1)]
            midiData = MidiData(file_name)
            timing_set = set()
            for i in range(midiData.getNumTracks()):
                track = midiData.getTrack(i)
                for note in track.notes:
                    timing = note.startTime
                    timing = round(timing * 4) / 4
                    timing_set.add(timing)
            timing_arr = list(timing_set)
            timing_arr.sort()
            time_per_note = (timing_arr[1] - timing_arr[0])/serializer.data['time_per_note']
            piece.time_per_note = time_per_note
            for i in range(midiData.getNumTracks()):
                track = midiData.getTrack(i)
                for note in track.notes:
                    timing = note.startTime/time_per_note
                    timing = round(timing * 4) / 4
                    timing = "{:.2f}".format(timing)
                    note_str = str(note)[str(note).index(' '):]
                    if note_str[2] == '#' or note_str[2] == 'b':
                        note_arr = [note.pitch, note_str[1], note_str[3], note_str[2]]
                    else:
                        note_arr = [note.pitch, note_str[1], note_str[2], note_str[3]]

                    if float(timing) not in notes:
                        notes[float(timing)] = [note_arr]
                    else:
                        notes[float(timing)].append(note_arr)

                    if timing not in grading:
                        grading[timing] = [note.pitch]
                    else:
                        grading[timing].append(note.pitch)

            sorted_notes = {}
            for key in notes.keys():
                sorted_notes[key] = notes[key]
            piece.notes = sorted_notes
            #piece.notes = timing_arr
            piece.grading = grading
            piece.save()
            