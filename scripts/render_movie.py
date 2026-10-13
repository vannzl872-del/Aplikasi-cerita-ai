import os
import sys
import argparse
import subprocess

def render_movie(lang='id', output_path='public/pramuka_pos_benteng_kosong_16x9.mp4'):
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    temp_dir = '/tmp/scout_render'
    os.makedirs(temp_dir, exist_ok=True)

    font_path = '/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf'

    scenes = [
        {
            'img': 'src/assets/images/scout_scene_one_1791902086727.jpg',
            'dur': 6.5,
            'title': 'Scene 1: Perdebatan di Pos Benteng Kosong' if lang == 'id' else 'Scene 1: Dispute at Pos Benteng Kosong',
            'speaker': 'CANDRA',
            'text': 'Kami sampai duluan! Kertas petunjuk ini milik kami!' if lang == 'id' else 'We arrived first! This clue paper belongs to us!',
            'zoom': 'min(zoom+0.0006,1.08)',
            'x': 'iw/2-(iw/zoom/2) - (on/200)*20',
            'y': 'ih/2-(ih/zoom/2)',
        },
        {
            'img': 'src/assets/images/scout_scene_two_1791902088092.jpg',
            'dur': 5.5,
            'title': 'Scene 2: Perebutan Peta yang Terbelah' if lang == 'id' else 'Scene 2: Tugging the Torn Map',
            'speaker': 'KETEGANGAN',
            'text': '*Menarik peta dengan emosi dan saling berebut*' if lang == 'id' else '*Aggressively pulling the map pieces apart in stubborn frustration*',
            'zoom': 'min(zoom+0.0012,1.15)',
            'x': 'iw/2-(iw/zoom/2)',
            'y': 'ih/2-(ih/zoom/2)',
        },
        {
            'img': 'src/assets/images/scout_scene_three_1791902088344.jpg',
            'dur': 6.0,
            'title': 'Scene 3: Langkah Tegas Sang Pramuka Putri' if lang == 'id' else "Scene 3: Rana's Decisive Intervention",
            'speaker': 'RANA',
            'text': 'Berhenti! Kalian tak bisa membacanya kalau saling berebut!' if lang == 'id' else "Stop! You won't be able to read it if you keep fighting each other!",
            'zoom': 'max(1.10-on*0.0005,1.02)',
            'x': 'iw/2-(iw/zoom/2)',
            'y': 'ih/2-(ih/zoom/2)',
        },
        {
            'img': 'src/assets/images/scout_scene_four_1791902088527.jpg',
            'dur': 6.5,
            'title': 'Scene 4: Pesan Bijak Tentang Kolaborasi' if lang == 'id' else 'Scene 4: Wisdom of Collaboration',
            'speaker': 'RANA',
            'text': 'Sini, gabungkan. Persaingan itu wajar, tapi kolaborasi membawa kita lebih jauh.' if lang == 'id' else 'Come here, combine them. Competition is natural, but collaboration takes us much further.',
            'zoom': 'min(zoom+0.0007,1.10)',
            'x': 'iw/2-(iw/zoom/2)',
            'y': 'ih/2-(ih/zoom/2) - (on/200)*10',
        },
        {
            'img': 'src/assets/images/scout_scene_five_1791902089878.jpg',
            'dur': 7.0,
            'title': 'Scene 5: Cahaya Emas Peta Rahasia' if lang == 'id' else 'Scene 5: Golden Glow of the Unified Map',
            'speaker': 'CANDRA & RIZKI',
            'text': 'Wah! Petanya bersinar! Jalur rahasianya terbuka!' if lang == 'id' else 'Whoa! The map is glowing! The secret trail is revealed!',
            'zoom': 'min(zoom+0.0008,1.12)',
            'x': 'iw/2-(iw/zoom/2)',
            'y': 'ih/2-(ih/zoom/2)',
        },
        {
            'img': 'src/assets/images/scout_scene_six_1791902089337.jpg',
            'dur': 8.5,
            'title': 'Scene 6: Kemenangan Sejati: Persatuan Pramuka' if lang == 'id' else 'Scene 6: True Victory: Scout Unity & Harmony',
            'speaker': 'SEMUA PRAMUKA',
            'text': 'Bersama, kita bisa menemukan harta karun ini!' if lang == 'id' else 'Together, we can discover this treasure!',
            'zoom': 'max(1.12-on*0.0005,1.03)',
            'x': 'iw/2-(iw/zoom/2)',
            'y': 'ih/2-(ih/zoom/2)',
        }
    ]

    clip_files = []
    print(f"Rendering 6 scenes (Lang: {lang}) to {output_path}...")

    for i, s in enumerate(scenes):
        out_clip = f"{temp_dir}/clip_{i}.mp4"
        dur = s['dur']
        total_frames = int(dur * 30)

        # Escape single quotes and colons for ffmpeg drawtext
        def esc(txt):
            return txt.replace("'", "'\\''").replace(":", "\\:")

        title_esc = esc(s['title'])
        speaker_esc = esc(f"[{s['speaker']}]")
        text_esc = esc(f'"{s["text"]}"')

        # Filters:
        # 1. scale to 1280x720
        # 2. zoompan
        # 3. drawbox letterbox scope (top/bottom)
        # 4. chapter header box and text top-left
        # 5. subtitle banner box and text bottom-center
        filters = [
            "scale=1280:720",
            f"zoompan=z='{s['zoom']}':d={total_frames}:x='{s['x']}':y='{s['y']}':s=1280x720:fps=30",
            # Letterbox top and bottom
            "drawbox=y=0:h=30:w=1280:color=black@0.9:t=fill",
            "drawbox=y=690:h=30:w=1280:color=black@0.9:t=fill",
            # Top-left scene badge
            "drawbox=x=40:y=42:w=360:h=38:color=black@0.75:t=fill",
            f"drawtext=fontfile='{font_path}':text='{title_esc}':x=55:y=55:fontsize=15:fontcolor=0xFBBF24",
            # Subtitle container bottom
            "drawbox=x=140:y=600:w=1000:h=76:color=black@0.85:t=fill",
            f"drawtext=fontfile='{font_path}':text='{speaker_esc}':x=165:y=614:fontsize=14:fontcolor=0xF59E0B",
            f"drawtext=fontfile='{font_path}':text='{text_esc}':x=165:y=642:fontsize=17:fontcolor=white"
        ]

        # On scene 6, add the moral quote banner at top
        if i == 5:
            quote_esc = esc("Bagian 2: Mengatasi Ketakutan Terbesar | Kolaborasi Selalu Mengalahkan Ego Persaingan")
            filters.append(
                f"drawtext=fontfile='{font_path}':text='{quote_esc}':x=(w-text_w)/2:y=85:fontsize=13:fontcolor=0xFDE047:box=1:boxcolor=black@0.7:boxborderw=6"
            )

        vf_arg = ",".join(filters)

        cmd = [
            'ffmpeg', '-y', '-loop', '1', '-i', s['img'],
            '-t', str(dur),
            '-vf', vf_arg,
            '-c:v', 'libx264', '-preset', 'veryfast', '-pix_fmt', 'yuv420p',
            out_clip
        ]
        subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        clip_files.append(out_clip)
        print(f"Rendered scene {i+1}/6 ({dur}s)")

    # Concat video
    concat_list = f"{temp_dir}/clips.txt"
    with open(concat_list, 'w') as f:
        for c in clip_files:
            f.write(f"file '{c}'\n")

    video_only = f"{temp_dir}/video_concat.mp4"
    subprocess.run([
        'ffmpeg', '-y', '-f', 'concat', '-safe', '0', '-i', concat_list,
        '-c', 'copy', video_only
    ], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

    # Audio tracks:
    audio_suffix = f"_{lang}.mp3"
    inputs = [
        '-i', video_only,
        '-i', f"src/assets/audio/scene1_candra{audio_suffix}",
        '-i', f"src/assets/audio/scene1_rizki{audio_suffix}",
        '-i', f"src/assets/audio/scene3_rana{audio_suffix}",
        '-i', f"src/assets/audio/scene4_rana{audio_suffix}",
        '-i', f"src/assets/audio/scene5_scouts{audio_suffix}",
        '-i', f"src/assets/audio/scene6_scouts{audio_suffix}"
    ]

    # Offsets in milliseconds matching the exact storyboard timing:
    # Scene 1 (0 to 6.5s): Candra at 600ms, Rizki at 3400ms
    # Scene 3 (12.0s to 18.0s): Rana at 12600ms
    # Scene 4 (18.0s to 24.5s): Rana at 18600ms
    # Scene 5 (24.5s to 31.5s): Scouts at 25500ms
    # Scene 6 (31.5s to 40.0s): Scouts at 32500ms
    filter_complex = (
        "[1:a]adelay=600|600[a1];"
        "[2:a]adelay=3400|3400[a2];"
        "[3:a]adelay=12600|12600[a3];"
        "[4:a]adelay=18600|18600[a4];"
        "[5:a]adelay=25500|25500[a5];"
        "[6:a]adelay=32500|32500[a6];"
        "[a1][a2][a3][a4][a5][a6]amix=inputs=6:dropout_transition=40:normalize=0[aout]"
    )

    final_cmd = ['ffmpeg', '-y'] + inputs + [
        '-filter_complex', filter_complex,
        '-map', '0:v',
        '-map', '[aout]',
        '-c:v', 'copy',
        '-c:a', 'aac', '-b:a', '192k',
        '-movflags', '+faststart',
        output_path
    ]

    subprocess.run(final_cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    size_mb = os.path.getsize(output_path) / (1024 * 1024)
    print(f"Final MP4 generated successfully: {output_path} ({size_mb:.2f} MB)")
    return output_path

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--lang', default='id', choices=['id', 'en'])
    parser.add_argument('--output', default='public/pramuka_pos_benteng_kosong_16x9.mp4')
    args = parser.parse_args()
    render_movie(args.lang, args.output)
