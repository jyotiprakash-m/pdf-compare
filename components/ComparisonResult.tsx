type ComparisonResultProps = {
  data: {
    comparison: string;
    model: string;
  };
};

const ComparisonResult: React.FC<ComparisonResultProps> = ({ data }) => {
  const { comparison, model } = data;

  if (!comparison) return null;

  const parseSections = (text: string) => {
    const lines = text.split("\n");
    const sections: { heading: string; content: string[] }[] = [];

    let currentHeading = "";
    let currentContent: string[] = [];

    for (const line of lines) {
      const headingMatch = line.match(/^(\d+\..*)$/); // Matches 1. 2. 3.
      if (headingMatch) {
        if (currentHeading) {
          sections.push({ heading: currentHeading, content: currentContent });
        }
        currentHeading = headingMatch[1];
        currentContent = [];
      } else {
        currentContent.push(line);
      }
    }

    if (currentHeading) {
      sections.push({ heading: currentHeading, content: currentContent });
    }

    return sections;
  };

  const sections = parseSections(comparison);

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white shadow-md rounded-2xl space-y-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">
        Document Comparison
      </h1>
      <p className="text-sm text-gray-500 mb-4">
        Model used: <span className="font-medium text-gray-700">{model}</span>
      </p>

      {sections.map(({ heading, content }) => (
        <div key={heading}>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            {heading}
          </h2>
          <ul className="pl-6 space-y-2 text-gray-700 list-disc">
            {content.map((line, index) => {
              const trimmed = line.trim();
              if (!trimmed) return null;

              const subpointMatch = trimmed.match(/^[a-d]\.\s/i);
              if (subpointMatch) {
                return (
                  <li key={index} className="ml-4 list-disc list-inside">
                    {trimmed}
                  </li>
                );
              }

              return (
                <li key={index} className="list-none ml-0">
                  {trimmed}
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default ComparisonResult;
