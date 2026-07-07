from moviepy import VideoFileClip

def extract_audio_from_video(
    video_path
):

    temp_audio = "temp_audio.mp3"

    video = VideoFileClip(
        video_path
    )

    video.audio.write_audiofile(
        temp_audio
    )

    return temp_audio