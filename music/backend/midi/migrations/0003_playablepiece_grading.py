# Generated by Django 3.1.7 on 2021-04-13 05:11

from django.db import migrations, models
from backend.midi.models import PlayablePiece
from backend.midi.midi_analyzer.MidiParser import MidiParser
from backend.midi.midi_analyzer.MidiData import MidiData
from backend.midi.midi_analyzer.MidiEventDecoder import MidiEventDecoder
import jsonfield.fields
import os


class Migration(migrations.Migration):

    dependencies = [
        ('midi', '0002_remove_playablepiece_grading'),
    ]

    operations = [
        migrations.AddField(
            model_name='playablepiece',
            name='grading',
            field=jsonfield.fields.JSONField(blank=True, default=list, null=True),
        ),
    ]

    for piece in PlayablePiece.objects.all():
        if piece.time_per_note:
            notes = {}
            grading = {}
            midi_file = os.getcwd() + "/media/" + str(piece.midi_file)
            midiData = MidiData(midi_file)
            for i in range(midiData.getNumTracks()):
                track = midiData.getTrack(i)
                for note in track.notes:
                    timing = note.startTime/piece.time_per_note
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
            piece.grading = grading
            piece.save()
