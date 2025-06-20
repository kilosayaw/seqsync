class MusicTempo {
    constructor(audioData, options = {}) {
        this.audioData = audioData.getChannelData(0);
        this.sampleRate = options.sampleRate || 44100;
        this.bufferSize = options.bufferSize || 2048;
        this.peakFindingOptions = options.peakFindingOptions || {};
        this.init();
    }

    init() {
        this.peaks = this.getPeaks(this.audioData, this.peakFindingOptions);
        this.intervals = this.getIntervals(this.peaks);
        this.tempos = this.groupByTempo(this.intervals);
        this.tempo = this.getTopTempo(this.tempos);
        this.beats = this.getBeats(this.tempo);
    }

    getPeaks(data, options) {
        const peakFindingTolerance = options.peakFindingTolerance !== undefined ? options.peakFindingTolerance : 2;
        const minPeakEnergy = options.minPeakEnergy !== undefined ? options.minPeakEnergy : 0.2;
        
        const peaksArray = [];
        for (let i = 0; i < data.length; i += this.bufferSize) {
            let sum = 0;
            for (let j = 0; j < this.bufferSize; j++) {
                sum += Math.abs(data[i + j] || 0);
            }
            const energy = sum / this.bufferSize;
            if (energy > minPeakEnergy) {
                peaksArray.push({ energy, time: i / this.sampleRate });
            }
        }
        
        peaksArray.sort((a, b) => b.energy - a.energy);
        const topPeaks = peaksArray.slice(0, peaksArray.length / peakFindingTolerance);
        topPeaks.sort((a, b) => a.time - b.time);
        
        return topPeaks;
    }

    getIntervals(peaks) {
        const intervals = [];
        for (let i = 0; i < peaks.length - 1; i++) {
            const interval = (peaks[i + 1].time - peaks[i].time) * 1000;
            intervals.push(interval);
        }
        return intervals;
    }

    groupByTempo(intervals) {
        const tempoCounts = [];
        intervals.forEach(interval => {
            if (interval > 0) {
                let theoreticalTempo = 60000 / interval;
                while (theoreticalTempo < 70) theoreticalTempo *= 2;
                while (theoreticalTempo > 140) theoreticalTempo /= 2;

                const foundTempo = tempoCounts.find(t => this.temposMatch(t.tempo, theoreticalTempo));
                if (foundTempo) {
                    foundTempo.count++;
                } else {
                    tempoCounts.push({ tempo: theoreticalTempo, count: 1 });
                }
            }
        });
        return tempoCounts;
    }

    temposMatch(a, b) {
        return Math.abs(a - b) < 10;
    }

    getTopTempo(tempos) {
        if (tempos.length === 0) return 0;
        tempos.sort((a, b) => b.count - a.count);
        return Math.round(tempos[0].tempo);
    }

    getBeats(tempo) {
        if (!tempo) return [];
        return [];
    }
}