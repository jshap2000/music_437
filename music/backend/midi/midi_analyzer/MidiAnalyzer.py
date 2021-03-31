from MidiData import MidiData
from JsonNote import JsonNote

# Takes in a midi file and returns a python list containing each note with 'midiNumber' and 'time'
# call json.dumps(jsonNoteList) to convert to json format

def analyzeMidiFile(midi_file):
    midiData = MidiData(midi_file)
    for i in range(midiData.getNumTracks()):
        track = midiData.getTrack(i)
        jsonNoteList = []
        for note in track.notes:
            jsonNote = jsonNote(note.pitch, str("{0:.2f}".format(round(note.startTime*.001, 2))))
            jsonNoteList.append(jsonNote.__dict__)
    return jsonNoteList
