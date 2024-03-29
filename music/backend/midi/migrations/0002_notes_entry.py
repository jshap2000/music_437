# Generated by Django 3.1.7 on 2021-04-16 20:03

from django.db import migrations, models
from backend.midi.models import PlayablePiece
from backend.midi.midi_analyzer.MidiParser import MidiParser
from backend.midi.midi_analyzer.MidiData import MidiData
from backend.midi.midi_analyzer.MidiEventDecoder import MidiEventDecoder
import os

def combine_names(apps, schema_editor):
    playable_pieces = [['Te_ver', 'Te Ver', 4, 500], ['corale', 'Corale', 3, 500]]
    PlayablePiece.objects.all().delete()

    for piece in playable_pieces:
        file_path = os.getcwd() + "/media/playable_midis/" + piece[0] + '.mid'
        PlayablePiece(title=piece[1], midi_file=file_path, time_signature=piece[2], time_per_note=piece[3]).save()

    for piece in PlayablePiece.objects.all():
        if piece.time_per_note:
            notes = {}
            grading = {}
            midi_file = str(piece.midi_file)
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


class Migration(migrations.Migration):

    dependencies = [
        ('midi', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(combine_names),
    ]

