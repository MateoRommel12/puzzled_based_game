// K-means Clustering Algorithm for Student Performance

class StudentClustering {
  constructor(students, k = 3) {
    this.students = students
    this.k = k // Number of clusters (Low, Medium, High performers)
    this.clusters = []
    this.centroids = []
  }

  // Normalize data to 0-1 range
  normalize(value, min, max) {
    if (max === min) return 0
    return (value - min) / (max - min)
  }

  // Calculate Euclidean distance
  distance(point1, point2) {
    return Math.sqrt(
      Math.pow(point1.literacy - point2.literacy, 2) +
        Math.pow(point1.math - point2.math, 2) +
        Math.pow(point1.score - point2.score, 2) +
        Math.pow(point1.games - point2.games, 2),
    )
  }

  // Prepare student data for clustering
  prepareData() {
    const scores = this.students.map((s) => s.totalScore)
    const games = this.students.map((s) => s.gamesPlayed)

    const minScore = Math.min(...scores)
    const maxScore = Math.max(...scores)
    const minGames = Math.min(...games)
    const maxGames = Math.max(...games)

    return this.students.map((student) => ({
      student: student,
      literacy: student.literacyProgress / 100,
      math: student.mathProgress / 100,
      score: this.normalize(student.totalScore, minScore, maxScore),
      games: this.normalize(student.gamesPlayed, minGames, maxGames),
    }))
  }

  // Initialize centroids randomly
  initializeCentroids(data) {
    const centroids = []
    const used = new Set()

    while (centroids.length < this.k && centroids.length < data.length) {
      const index = Math.floor(Math.random() * data.length)
      if (!used.has(index)) {
        used.add(index)
        centroids.push({
          literacy: data[index].literacy,
          math: data[index].math,
          score: data[index].score,
          games: data[index].games,
        })
      }
    }

    return centroids
  }

  // Assign students to nearest centroid
  assignClusters(data) {
    return data.map((point) => {
      let minDist = Number.POSITIVE_INFINITY
      let cluster = 0

      this.centroids.forEach((centroid, i) => {
        const dist = this.distance(point, centroid)
        if (dist < minDist) {
          minDist = dist
          cluster = i
        }
      })

      return { ...point, cluster }
    })
  }

  // Update centroids based on cluster assignments
  updateCentroids(data) {
    const newCentroids = []

    for (let i = 0; i < this.k; i++) {
      const clusterPoints = data.filter((p) => p.cluster === i)

      if (clusterPoints.length > 0) {
        newCentroids.push({
          literacy: clusterPoints.reduce((sum, p) => sum + p.literacy, 0) / clusterPoints.length,
          math: clusterPoints.reduce((sum, p) => sum + p.math, 0) / clusterPoints.length,
          score: clusterPoints.reduce((sum, p) => sum + p.score, 0) / clusterPoints.length,
          games: clusterPoints.reduce((sum, p) => sum + p.games, 0) / clusterPoints.length,
        })
      } else {
        newCentroids.push(this.centroids[i])
      }
    }

    return newCentroids
  }

  // Run K-means clustering
  cluster(maxIterations = 100) {
    if (this.students.length === 0) {
      return []
    }

    const data = this.prepareData()
    this.centroids = this.initializeCentroids(data)

    let iteration = 0
    let converged = false

    while (iteration < maxIterations && !converged) {
      const clusteredData = this.assignClusters(data)
      const newCentroids = this.updateCentroids(clusteredData)

      // Check for convergence
      converged = this.centroids.every((centroid, i) => {
        return this.distance(centroid, newCentroids[i]) < 0.001
      })

      this.centroids = newCentroids
      iteration++
    }

    // Final assignment
    const result = this.assignClusters(data)

    // Sort clusters by average performance (0 = low, 1 = medium, 2 = high)
    const clusterStats = this.calculateClusterStats(result)
    const sortedClusters = clusterStats
      .map((stat, index) => ({ index, avgPerformance: stat.avgPerformance }))
      .sort((a, b) => a.avgPerformance - b.avgPerformance)

    // Remap cluster indices
    const clusterMap = {}
    sortedClusters.forEach((cluster, newIndex) => {
      clusterMap[cluster.index] = newIndex
    })

    return result.map((point) => ({
      ...point,
      cluster: clusterMap[point.cluster],
    }))
  }

  // Calculate statistics for each cluster
  calculateClusterStats(data) {
    const stats = []

    for (let i = 0; i < this.k; i++) {
      const clusterPoints = data.filter((p) => p.cluster === i)

      if (clusterPoints.length > 0) {
        const avgLiteracy = clusterPoints.reduce((sum, p) => sum + p.literacy, 0) / clusterPoints.length
        const avgMath = clusterPoints.reduce((sum, p) => sum + p.math, 0) / clusterPoints.length
        const avgScore = clusterPoints.reduce((sum, p) => sum + p.score, 0) / clusterPoints.length
        const avgGames = clusterPoints.reduce((sum, p) => sum + p.games, 0) / clusterPoints.length

        stats.push({
          cluster: i,
          count: clusterPoints.length,
          avgLiteracy: avgLiteracy * 100,
          avgMath: avgMath * 100,
          avgScore: avgScore,
          avgGames: avgGames,
          avgPerformance: (avgLiteracy + avgMath) / 2,
        })
      }
    }

    return stats
  }
}

// Export for use in admin dashboard
if (typeof module !== "undefined" && module.exports) {
  module.exports = StudentClustering
}
