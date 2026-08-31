useEffect(() => {
  const fetchMyGroupStudents = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/group", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const currentUserId = localStorage.getItem("userId"); // login somoy save kora thakle
      const myGroup = response.data.groups.find(
        (g) => g.mentor?.user?._id === currentUserId
      );

      if (myGroup) {
        setStudents(myGroup.students || []);
      } else {
        setError("No group found for this mentor");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load students");
      console.error(err);
    }
  };

  fetchMyGroupStudents();
}, [token]);